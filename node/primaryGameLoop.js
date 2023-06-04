/* eslint-disable no-param-reassign */
import fs from 'fs';
import { AsyncParser } from '@json2csv/node';
import display from './display.js';
import playSound from './playSound.js';
import getRandomInt from './include/getRandomInt.js';
import getRange from './include/getRange.js';
import getRandVector from './include/getRandVector.js';
import updateMaxTime from './gameFunctions/updateMaxTime.js';
import updateDigitalReadout from './gameFunctions/updateDigitalReadout.js';

const csvParser = new AsyncParser();

/**
 * Primary Game Loop
 * @param {Object} settings
 * @param {Object} gameState
 * @param {Object} johnnyFiveObjects
 * @returns {Promise<void>}
 */
async function primaryGameLoop({ settings, gameState, johnnyFiveObjects }) {
  if (gameState.atGameIntro) {
    gameState.clockUpdate = updateDigitalReadout({
      gameState,
      settings,
      johnnyFiveObjects,
    });
    display.update({ gameState, settings, state: 'intro', data: '' });
    // TODO: This requires all panels to be armed to start.
    //       Change this to allow playing with only the armed panels,
    //       when at least one is armed and a "start" button is pressed.
    // TODO: This update must be applied to ALL locations that make use of the
    //       stationList variable.
    // TODO: Check to see if ANY switch is armed,
    // TODO: If so, tell THAT station to push "x" button to start.
    //              and other stations to arm to join.
    if (
      settings.stationList[0][0].currentStatus === 'on' &&
      settings.stationList[1][0].currentStatus === 'on'
    ) {
      gameState.atGameIntro = false;
    }
  } else if (!gameState.gameStarted) {
    gameState.score = 0;
    display.update({ gameState, settings, state: 'notStarted' });
    gameState.gameStartedTime = Date.now();
    gameState.gameStarted = true;
  } else if (gameState.gameOver) {
    display.update({
      gameState,
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
    display.update({ gameState, settings, state: 'maxTimeReached' });
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
            settings.stationList[1][gameState.stationsInPlay[1]].currentStatus,
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
        display.update({
          gameState,
          settings,
          state: 'generatingNextCommand',
        });
      }
    }

    if (player2done !== gameState.player2done) {
      gameState.player2done = player2done;
      if (player2done) {
        playSound({ sound: settings.soundFilenames.success, settings });
      } else {
        // Display command again if the "player done" goes from true to false again.
        display.update({
          gameState,
          settings,
          state: 'generatingNextCommand',
        });
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
      gameState.maxTime = updateMaxTime(gameState);
    } else {
      if (!settings.noTimeOut) {
        gameState.timeElapsed++;
      }
      if (player1done && !player2done) {
        display.update({
          gameState,
          settings,
          state: 'player1done',
          data: gameState,
        });
      } else if (player2done && !player1done) {
        display.update({
          gameState,
          settings,
          state: 'player2done',
          data: gameState,
        });
      } else {
        // This does NOTHING on the LCD.
        display.update({
          gameState,
          settings,
          state: 'waitingForInput',
          data: gameState,
        });
      }
    }
    gameState.clockUpdate = updateDigitalReadout({
      gameState,
      settings,
      johnnyFiveObjects,
    });
  } else if (!gameState.waitingForInput && !gameState.gameOver) {
    // This is where we come up with the NEXT (or first) command to request

    // Clear all inputs
    for (let i = 0; i < settings.stationList.length; i++) {
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
    // TODO: UN-initialize the stations when the game is over, so it has to be done again here on each new game
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
          settings.stationList[i][gameState.stationsInPlay[i]].currentStatus ===
          'on'
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
      gameState,
      settings,
      state: 'generatingNextCommand',
      data: { displayNameForStation1, displayNameForStation2 },
    });
    gameState.waitingForInput = true;
  } else {
    display.update({ gameState, settings, state: 'crash' });
  }
}

export default primaryGameLoop;
