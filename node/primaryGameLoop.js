/* eslint-disable no-param-reassign, func-names */
import five from 'johnny-five';
import fs from 'fs';
import { AsyncParser } from '@json2csv/node';

import gameState from './gameState.js';
import display from './display.js';
import playSound from './playSound.js';
import pad from './include/pad.js';

let settings;

const csvParser = new AsyncParser();

const johnnyFiveObjects = {};

function init() {
  if (settings.runWithoutArduino) {
    gameState.boardInitiated = true;
  } else {
    const board = new five.Board({
      port: settings.primaryJohnnyFiveArduinoPort.name,
      repl: settings.johnnyFiveRepl, // IF you don't want the REPL to display, because maybe you are doing something else on the terminal, turn it off this way.
      debug: settings.johnnyFiveDebug, // Same for the "debug" messages like board Found and Connected.
    });
    // http://johnny-five.io/api/button/
    board.on('ready', () => {
      // NOTE: If we name the FILE we load to each Arduino differently,
      // then we can use THIS below to differentiate them, regardless of what port each is plugged in to or initializes first.
      // https://stackoverflow.com/a/34713418/4982408
      // console.log(board.io.firmware.name);
      // For now though using the board serial number to get the port is working fine.

      // TODO: Do we need to update/replace the firmata on either board?

      johnnyFiveObjects.digitalReadout2 = new five.Led.Digits({
        controller: 'HT16K33',
      });
      johnnyFiveObjects.digitalReadout1 = new five.Led.Digits({
        controller: 'HT16K33',
      });

      // Volume Knob
      johnnyFiveObjects.volumeKnob = new five.Sensor({
        pin: settings.volume.knob.pin,
        threshold: settings.volume.knob.potChangeThreshold, // This will emit a 'change' if it changes by this much.
        // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
      });
      johnnyFiveObjects.volumeKnob.on('change', function () {
        // Do NOT make this an arrow function!
        // this.value must reference the this that called it!
        // Remember knob works in reverse.
        if (this.value < settings.volume.knob.maximum) {
          settings.volume.setting = settings.volume.maximum;
        } else if (this.value > settings.volume.knob.minimum) {
          settings.volume.setting = settings.volume.zero;
        } else {
          const OldRange =
            settings.volume.knob.maximum - settings.volume.knob.minimum;
          if (OldRange === 0) settings.volume.setting = settings.volume.minimum;
          else {
            const NewRange = settings.volume.maximum - settings.volume.minimum;
            settings.volume.setting = Math.round(
              ((this.value - settings.volume.knob.minimum) * NewRange) /
                OldRange +
                settings.volume.minimum,
            );
          }
        }
        if (settings.debug) {
          console.log(
            `\nVolume Knob (${settings.volume.knob.pin}): ${this.value} - Volume: ${settings.volume.setting}`,
          );
        }
      });

      for (let i = 0; i < settings.stationList.length; i++) {
        // eslint-disable-next-line no-loop-func
        settings.stationList[i].forEach((input) => {
          if (
            ['switch', 'button'].indexOf(input.type) !== -1 &&
            settings.hasOwnProperty('soundFilenames') &&
            settings.soundFilenames.hasOwnProperty('incorrect') &&
            settings.soundFilenames.hasOwnProperty('success')
          ) {
            let isPullup = true;
            if (input.subType === 'arm') {
              isPullup = false;
            }
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Button({
              pin: input.pin,
              isPullup,
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('press', () => {
              input.hasBeenPressed = true;
              const previousStatus = input.currentStatus;
              input.currentStatus = 'on';
              let soundName = settings.soundFilenames.incorrect;
              if (input.correct) {
                soundName = settings.soundFilenames.success;
                if (input.subType === 'big') {
                  soundName = settings.soundFilenames.bigButton;
                }
              }
              if (input.subType === 'arm') {
                soundName = settings.soundFilenames.armingSwitch;
              }
              if (settings.debug) {
                console.log(`\nStation ${i + 1}`);
                console.log(input);
              }
              if (
                (gameState.gameStarted && !gameState.gameOver) ||
                input.subType === 'arm'
              ) {
                playSound({ sound: soundName, settings });
              } else if (
                input.currentStatus !== previousStatus &&
                settings.soundFilenames.hasOwnProperty('random') &&
                Array.isArray(settings.soundFilenames.random) &&
                settings.soundFilenames.random.length > 1
              ) {
                // Switches tend to throw a lot of "on" status all at once and repeat the sound,
                // so the check against previousStatus fixes that.
                // TODO: Actually, I'm not sure that is true. The sound may just repeat in the wav file xD  Maybe undo this if that isn't the case.

                // Play random sound when game isn't running.
                // TODO: Improve on this and/or make a function.
                // It would be better if the same button played the same sound,
                // each time.
                // Add an "idleSound" key to each stationList object, and use that sound name,
                // or if it doesn't exist on an entry, then go for "random".
                let randomSound = settings.soundFilenames.random[1];
                if (input.type === 'button') {
                  randomSound = settings.soundFilenames.random[0];
                }
                // const randomSound =
                //   settings.soundFilenames.random[
                //     Math.floor(
                //       Math.random() * settings.soundFilenames.random.length,
                //     )
                //   ];
                if (settings.debug) {
                  console.log(`Random Sound: ${randomSound}`);
                }
                playSound({ sound: randomSound, settings });
              }
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('hold', () => {
              input.currentStatus = 'on';
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('release', () => {
              input.hasBeenPressed = true;
              input.currentStatus = 'off';
              if (
                input.type === 'switch' &&
                !gameState.gameOver &&
                gameState.gameStarted
              ) {
                let soundName = settings.soundFilenames.incorrect;
                if (input.correct) {
                  soundName = settings.soundFilenames.success;
                }
                playSound({ sound: soundName, settings });
              }
            });
          } else if (input.type === 'knob') {
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Sensor({
              pin: input.pin,
              threshold: settings.potChangeThreshold, // This will emit a 'change' if it changes by this much.
              // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
            });

            // Inject the `sensor` hardware into
            // the Repl instance's context;
            // allows direct command line access
            // board.repl.inject({
            //     pot: potentiometer
            // });

            // "data" get the current reading from the potentiometer
            /*
                  potentiometer.on("data", function() {
                    console.log(this.value, this.raw);
                  });
                  */

            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('change', function () {
              // Do NOT make this an arrow function!
              // this.value must reference the this that called it!
              input.hasBeenPressed = true;
              input.currentStatus = this.value;
              if (settings.debug) {
                console.log(`\nStation ${i + 1}`);
                console.log(input);
              }
              // console.log(input);
            });
          }
          if (settings.debug) {
            // This prints out all button/switch labels at the start of the program.
            console.log(`Station ${i} input ${input.id} is ${input.label}.`);
          }
        });
      }

      gameState.boardInitiated = true;
    });
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line consistent-return
function getRange(int) {
  const ranges = {
    down: { less: 10, greater: 950 },
    left: { less: 950, greater: 600 },
    up: { less: 600, greater: 300 },
    right: { less: 300, greater: 10 },
  };
  for (const vector in ranges) {
    if (Object.prototype.hasOwnProperty.call(ranges, vector)) {
      if (int < ranges[vector].less && int > ranges[vector].greater) {
        // we found the right one
        return vector;
      }
      if (ranges[vector].less < ranges[vector].greater) {
        if (int < ranges[vector].less || int > ranges[vector].greater) {
          return vector;
        }
      }
    }
  }
}

function getRandVector() {
  const possibleVectors = ['up', 'left', 'right'];
  const rand = Math.floor(Math.random() * possibleVectors.length);
  return possibleVectors[rand];
}

function updateMaxTime() {
  // MINIMUM TIME HERE:
  if (gameState.score > 10 && gameState.maxTime > 5) {
    gameState.maxTime--;
  } else if (gameState.score > 20 && gameState.maxTime > 4) {
    gameState.maxTime--;
  } else if (gameState.score > 30 && gameState.maxTime > 3) {
    gameState.maxTime--;
  } else if (gameState.score > 40 && gameState.maxTime > 2) {
    gameState.maxTime--;
  } else if (gameState.score > 50 && gameState.maxTime > 1) {
    gameState.maxTime--;
  }
}

function updateDigitalReadout() {
  if (gameState.clockUpdate > 5 && !settings.runWithoutArduino) {
    const output = pad(
      gameState.maxTime * (1000 / settings.loopTime) - gameState.timeElapsed,
      4,
    );
    johnnyFiveObjects.digitalReadout1.print(output);
    johnnyFiveObjects.digitalReadout2.print(output);
    gameState.clockUpdate = 0;
  } else {
    gameState.clockUpdate++;
  }
}

async function primaryGameLoop(initSettings) {
  if (!gameState.initCalled) {
    if (initSettings && !settings) {
      settings = initSettings;
    }
    gameState.initCalled = true;
    init();
  }
  if (gameState.boardInitiated) {
    if (gameState.atGameIntro) {
      updateDigitalReadout();
      display.update({ settings, state: 'intro' });
      // TODO: This requires all panels to be armed to start.
      //       Change this to allow playing with only the armed panels,
      //       when at least one is armed and a "start" button is pressed.
      // TODO: This update must be applied to ALL locations that make use of the
      //       stationList variable.
      if (
        settings.stationList[0][0].currentStatus === 'on' &&
        settings.stationList[1][0].currentStatus === 'on'
      ) {
        gameState.atGameIntro = false;
      }
    } else if (!gameState.gameStarted) {
      gameState.score = 0;
      display.update({ settings, state: 'notStarted' });
      gameState.gameStartedTime = Date.now();
      gameState.gameStarted = true;
    } else if (gameState.gameOver) {
      display.update({
        settings,
        state: 'gameOver',
        data: { score: gameState.score },
      });
      if (!gameState.gameOverTasksCompleted) {
        playSound({ sound: settings.soundFilenames.gameOver, settings });
        gameState.statistics.push({
          gameStartedTime: gameState.gameStartedTime,
          station1: gameState.displayNameForStation1,
          station2: gameState.displayNameForStation2,
          timeElapsed: gameState.timeElapsed,
          score: gameState.score,
          gameEndedTime: Date.now(),
        });
        let csv;
        try {
          csv = await csvParser.parse(gameState.statistics).promise();
        } catch (err) {
          console.error(err);
        }
        if (csv) {
          csv = `${csv}\n`;
          try {
            fs.appendFileSync('statistics.csv', csv);
          } catch (err) {
            console.log(err);
            /* Handle the error */
          }
        }
        gameState.gameOverTasksCompleted = true;
      }
      if (
        settings.stationList[0][0].currentStatus === 'off' &&
        settings.stationList[1][0].currentStatus === 'off'
      ) {
        gameState.gameOver = false;
        gameState.gameOverTasksCompleted = false;
        gameState.timeElapsed = 0;
        gameState.maxTime = settings.initialTime;
        gameState.score = 0;
        gameState.waitingForInput = false;
        gameState.player1done = false;
        gameState.player2done = false;
        gameState.gameStarted = false;
        gameState.atGameIntro = true;
        gameState.statistics.length = 0;
      }
    } else if (
      gameState.maxTime * (1000 / settings.loopTime) - gameState.timeElapsed <
      1
    ) {
      display.update({ settings, state: 'maxTimeReached' });
      if (!settings.runWithoutArduino) {
        johnnyFiveObjects.digitalReadout1.print('0000');
        johnnyFiveObjects.digitalReadout2.print('0000');
      }
      gameState.gameOver = true;
    } else if (gameState.waitingForInput) {
      let done = false;
      let player1done =
        settings.stationList[0][gameState.stationsInPlay[0]].hasBeenPressed;
      let player2done =
        settings.stationList[1][gameState.stationsInPlay[1]].hasBeenPressed;

      if (
        player1done &&
        settings.stationList[0][gameState.stationsInPlay[0]].type === 'knob'
      ) {
        if (
          getRange(
            settings.stationList[0][gameState.stationsInPlay[0]].currentStatus,
          ) !== gameState.requiredKnobPosition1
        ) {
          player1done = false;
        }
      }

      if (
        player2done &&
        settings.stationList[1][gameState.stationsInPlay[1]].type === 'knob'
      ) {
        if (
          settings.stationList[1][gameState.stationsInPlay[1]].type === 'knob'
        ) {
          if (
            getRange(
              settings.stationList[1][gameState.stationsInPlay[1]]
                .currentStatus,
            ) !== gameState.requiredKnobPosition2
          ) {
            player2done = false;
          }
        }
      }

      if (player1done !== gameState.player1done) {
        gameState.player1done = player1done;
        if (player1done) {
          playSound({ sound: settings.soundFilenames.success, settings });
        } else {
          // Display command again if the "player done" goes from true to false again.
          display.update({ settings, state: 'generatingNextCommand' });
        }
      }

      if (player2done !== gameState.player2done) {
        gameState.player2done = player2done;
        if (player2done) {
          playSound({ sound: settings.soundFilenames.success, settings });
        } else {
          // Display command again if the "player done" goes from true to false again.
          display.update({ settings, state: 'generatingNextCommand' });
        }
      }

      if (player1done && player2done) {
        done = true;
      }

      if (done) {
        gameState.score++;
        gameState.statistics.push({
          gameStartedTime: gameState.gameStartedTime,
          station1: gameState.displayNameForStation1,
          station2: gameState.displayNameForStation2,
          timeElapsed: gameState.timeElapsed,
          score: gameState.score,
          gameEndedTime: 0,
        });
        gameState.waitingForInput = false;
        gameState.timeElapsed = 0;
        gameState.player1done = false;
        gameState.player2done = false;
        updateMaxTime();
      } else {
        if (!settings.noTimeOut) {
          gameState.timeElapsed++;
        }
        if (player1done && !player2done) {
          display.update({ settings, state: 'player1done', data: gameState });
        } else if (player2done && !player1done) {
          display.update({ settings, state: 'player2done', data: gameState });
        } else {
          // This does NOTHING on the LCD.
          display.update({
            settings,
            state: 'waitingForInput',
            data: gameState,
          });
        }
      }
      updateDigitalReadout();
    } else if (!gameState.waitingForInput && !gameState.gameOver) {
      // This is where we come up with the NEXT (or first) command to request

      // Clear all inputs
      for (let i = 0; i < stationList.length; i++) {
        settings.stationList[i].forEach((button) => {
          button.hasBeenPressed = false;
          button.correct = false;
        });
      }

      // Initialize station count/list.
      /*
       * Each board or each game cycle could theoretically have a different
       * number of Stations (sides) in play for any given game.
       * So we check the "stationsInPlay" variable to see what this is.
       * TODO: Add a menu item to allow this to be variable.
       * Or maybe just a way to start the game without arming all stations,
       * and hence get less than "totalStationCount" stations in play.
       */
      // TODO: UNinitialize the stations when the game is over, so it has to be done again here on each new game
      if (gameState.instructionsForStations.length === 0) {
        for (let i = 0; i < gameState.stationsArmed; i++) {
          gameState.instructionsForStations[i] = 0; // initializing the array
        }
      }
      if (gameState.stationsInPlay.length === 0) {
        for (let i = 0; i < gameState.stationsArmed; i++) {
          gameState.stationsInPlay[i] = 0; // initializing the array
        }
      }

      do {
        gameState.stationsInPlay[0] = getRandomInt(
          1,
          settings.stationList[0].length - 1,
        );
      } while (
        gameState.recentInputList[0].indexOf(gameState.stationsInPlay[0]) !== -1
      );
      gameState.recentInputList[0].push(gameState.stationsInPlay[0]);
      gameState.recentInputList[0].shift();

      do {
        gameState.stationsInPlay[1] = getRandomInt(
          1,
          settings.stationList[1].length - 1,
        );
      } while (
        gameState.recentInputList[1].indexOf(gameState.stationsInPlay[1]) !== -1
      );
      gameState.recentInputList[1].push(gameState.stationsInPlay[1]);
      gameState.recentInputList[1].shift();

      let displayNameForStation1 =
        settings.stationList[0][gameState.stationsInPlay[0]].label;
      settings.stationList[0][gameState.stationsInPlay[0]].correct = true;
      let displayNameForStation2 =
        settings.stationList[1][gameState.stationsInPlay[1]].label;
      settings.stationList[1][gameState.stationsInPlay[1]].correct = true;

      for (let i = 0; i < gameState.stationsArmed; i++) {
        let knobDirection = getRandVector();
        while (
          knobDirection ===
          getRange(
            settings.stationList[i][gameState.stationsInPlay[i]].currentStatus,
          )
        ) {
          knobDirection = getRandVector();
        }
        let displayName;
        if (
          settings.stationList[i][gameState.stationsInPlay[i]].type === 'button'
        ) {
          displayName =
            settings.stationList[i][gameState.stationsInPlay[i]].funName;
        } else if (
          settings.stationList[i][gameState.stationsInPlay[i]].type === 'switch'
        ) {
          if (
            settings.stationList[i][gameState.stationsInPlay[i]]
              .currentStatus === 'on'
          ) {
            displayName = `Turn ${
              settings.stationList[i][gameState.stationsInPlay[i]].funName
            } Off.`;
          } else {
            displayName = `Turn ${
              settings.stationList[i][gameState.stationsInPlay[i]].funName
            } ON.`;
          }
        } else if (
          settings.stationList[i][gameState.stationsInPlay[i]].type === 'knob'
        ) {
          displayName = `Set ${
            settings.stationList[i][gameState.stationsInPlay[i]].funName
          } to ${
            settings.stationList[i][gameState.stationsInPlay[i]][knobDirection]
          }`;
        }
        if (i === 0) {
          displayNameForStation1 = displayName;
          gameState.displayNameForStation1 = displayName;
          gameState.requiredKnobPosition1 = knobDirection;
        } else {
          displayNameForStation2 = displayName;
          gameState.displayNameForStation2 = displayName;
          gameState.requiredKnobPosition2 = knobDirection;
        }
      }
      display.update({
        settings,
        state: 'generatingNextCommand',
        data: { displayNameForStation1, displayNameForStation2 },
      });
      gameState.waitingForInput = true;
    } else {
      display.update({ settings, state: 'crash' });
    }
  }
  setTimeout(primaryGameLoop, settings.loopTime);
}

export default primaryGameLoop;
