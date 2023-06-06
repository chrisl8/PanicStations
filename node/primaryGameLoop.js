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
 * Generate the next input to be requested by the game.
 * @param {Object} settings
 * @param {Object} gameState
 */
function generateNextInput({ settings, gameState }) {
  // This is where we come up with the NEXT (or first) command to request

  // TODO: Do this for each station independently, in case we want the players to be allowed to play "out of sync"

  for (const [key, value] of Object.entries(settings.stations)) {
    // Only armed stations participate
    // TODO: Handle the case of user disarming a station during gameplay.
    //       Should this just be ignored?
    //       or have some other function?
    //       Ether way, I don't think it belongs here in the generateNextInput function.
    //       And test it.
    if (value.armed) {
      // TODO: We may only want to do this for some stations and not others, i.e. if we are allowing one player to be done before the other,
      //       aka. playing "out of sync"

      // Clear all inputs
      // eslint-disable-next-line no-loop-func
      value.inputs.forEach((input) => {
        input.hasBeenPressed = false;
        input.correct = false;
      });

      if (!value.recentInputList) {
        value.recentInputList = Array(settings.recentInputMemory).fill(0);
      }

      // Find a random numbered input within range of input list and not in the recently used list.
      let newInput;
      do {
        newInput = getRandomInt(1, value.inputs.length - 1);
      } while (value.recentInputList.indexOf(newInput) !== -1);
      value.recentInputList.push(newInput);
      value.recentInputList.shift();

      console.log(value.recentInputList);

      let knobDirection;
      let displayName = value.inputs[newInput].label;
      value.inputs[newInput].correct = true;

      if (value.inputs[newInput].type === 'button') {
        displayName = value.inputs[newInput].funName;
      } else if (value.inputs[newInput].type === 'switch') {
        if (value.inputs[newInput].currentStatus === 'on') {
          displayName = `Turn ${value.inputs[newInput].funName} Off.`;
        } else {
          displayName = `Turn ${value.inputs[newInput].funName} ON.`;
        }
      } else if (value.inputs[newInput].type === 'knob') {
        knobDirection = getRandVector();
        while (
          knobDirection === getRange(value.inputs[newInput].currentStatus)
        ) {
          knobDirection = getRandVector();
        }
        displayName = `Set ${value.inputs[newInput].funName} to ${value.inputs[newInput][knobDirection]}`;
      }

      value.displayName = displayName;
      value.requiredKnobPosition = knobDirection;
      value.newInput = newInput;

      console.log('newInput', key, value.newInput, value.displayName);
      display.update({
        gameState,
        settings,
        state: 'newInput',
        data: { station: key },
      });
    }
  }
}

/**
 * Primary Game Loop
 * @param {Object} settings
 * @param {Object} gameState
 * @param {Object} johnnyFiveObjects
 * @returns {Promise<void>}
 */
async function primaryGameLoop({ settings, gameState, johnnyFiveObjects }) {
  switch (gameState.loopState) {
    case 'intro':
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
      // eslint-disable-next-line no-case-declarations
      let allStationsArmed = true;
      for (const [, value] of Object.entries(settings.stations)) {
        if (!value.armed) {
          allStationsArmed = false;
        }
      }
      if (allStationsArmed) {
        gameState.loopState = 'startNewGame';
      }
      break;
    case 'startNewGame':
      gameState.score = 0;
      display.update({ gameState, settings, state: 'notStarted', data: '' });
      gameState.gameStartedTime = Date.now();
      generateNextInput({ settings, gameState });
      gameState.loopState = 'gameInProgress';
      break;
    case 'gameInProgress':
      // TODO: Allow "async" completion of inputs.
      for (const [key, value] of Object.entries(settings.stations)) {
        let stationDone = value.inputs[value.newInput].hasBeenPressed;

        if (stationDone && value.inputs[value.newInput].type === 'knob') {
          if (
            getRange(value.inputs[value.newInput].currentStatus) !==
            value.requiredKnobPosition
          ) {
            stationDone = false;
          }
        }

        if (value.done !== stationDone) {
          value.done = stationDone;
          if (stationDone) {
            playSound({ sound: settings.soundFilenames.success, settings });
          } else {
            // Display command again if the "player done" goes from true to false again.
            display.update({
              gameState,
              settings,
              state: 'newInput',
              data: { station: key },
            });
          }
        }
      }

      // eslint-disable-next-line no-case-declarations
      let allStationsDone = true;
      for (const [, value] of Object.entries(settings.stations)) {
        if (!value.done) {
          allStationsDone = false;
        }
      }

      if (allStationsDone) {
        gameState.score++;
        gameState.statistics.push({
          gameStartedTime: gameState.gameStartedTime,
          station1: gameState.displayNameForStation1,
          station2: gameState.displayNameForStation2,
          timeElapsed: gameState.timeElapsed,
          score: gameState.score,
          gameEndedTime: 0,
        });
        gameState.timeElapsed = 0;
        gameState.maxTime = updateMaxTime(gameState);
        generateNextInput({ settings, gameState });
      } else {
        if (!settings.noTimeOut) {
          gameState.timeElapsed++;
        }
        // Update display for any "done" players.
        for (const [key, value] of Object.entries(settings.stations)) {
          if (value.done) {
            display.update({
              gameState,
              settings,
              state: 'stationDone',
              data: { station: key },
            });
          }
        }
        if (
          gameState.maxTime * (1000 / settings.loopTime) -
            gameState.timeElapsed <
          1
        ) {
          display.update({ gameState, settings, state: 'maxTimeReached' });
          if (!settings.runWithoutArduino) {
            johnnyFiveObjects.digitalReadout1.print('0000');
            johnnyFiveObjects.digitalReadout2.print('0000');
          }
          gameState.loopState = 'gameOver';
        } else {
          gameState.clockUpdate = updateDigitalReadout({
            gameState,
            settings,
            johnnyFiveObjects,
          });
        }
      }
      break;
    case 'gameOver':
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
      // eslint-disable-next-line no-case-declarations
      let allStationsDisarmed = true;
      for (const [, value] of Object.entries(settings.stations)) {
        if (value.armed) {
          allStationsDisarmed = false;
        }
      }
      if (allStationsDisarmed) {
        // Reset all global game state
        gameState.gameOverTasksCompleted = false;
        gameState.timeElapsed = 0;
        gameState.maxTime = settings.initialTime;
        gameState.score = 0;
        gameState.statistics.length = 0;
        gameState.loopState = 'intro';

        // Reset all per-station state
        for (const [, value] of Object.entries(settings.stations)) {
          value.done = false;
        }
      }
      break;
    default:
      display.update({ gameState, settings, state: 'crash', data: '' });
      break;
  }
}

export default primaryGameLoop;
