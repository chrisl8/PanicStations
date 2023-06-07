/* eslint-disable no-param-reassign */
import display from './display.js';
import playSound from './playSound.js';
import getRandomInt from './include/getRandomInt.js';
import getRange from './include/getRange.js';
import getRandVector from './include/getRandVector.js';
import updateMaxTime from './gameFunctions/updateMaxTime.js';
import updateDigitalReadouts from './gameFunctions/updateDigitalReadouts.js';

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
  let gamePlayStats;
  switch (gameState.loopState) {
    case 'intro':
      gameState.clockUpdate = updateDigitalReadouts({
        gameState,
        settings,
        johnnyFiveObjects,
      });
      display.update({ gameState, settings, state: 'intro', data: '' });
      // TODO: This requires all panels to be armed to start.
      //       Change this to allow playing with only the armed panels,
      //       when at least one is armed and a "start" button is pressed.
      //       Check to see if ANY switch is armed,
      //       If so, tell THAT station to push "x" button to start.
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
      // Reset all global game state
      gameState.timeElapsedForThisInput = 0;
      gameState.maxTime = settings.initialTime;
      gameState.gameStats = {
        score: 0,
        startedTime: Date.now(),
        gamePlayStats: [],
      };

      // Reset all per-station state
      for (const [, value] of Object.entries(settings.stations)) {
        value.done = false;
      }
      display.update({ gameState, settings, state: 'notStarted', data: '' });
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
            gameState.gameStats.gamePlayStats.push({
              station: key,
              input: value.inputs[value.newInput].funName,
              timeElapsed: gameState.timeElapsedForThisInput,
              success: 1,
            });
            playSound({ sound: settings.soundFilenames.success, settings });
          } else {
            // Display command again if the "player done" goes from true to false again,
            // which can happen with knobs while waiting on the other player.
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
        gameState.gameStats.score++;
        gameState.timeElapsedForThisInput = 0;
        gameState.maxTime = updateMaxTime(gameState);
        generateNextInput({ settings, gameState });
      } else {
        if (!settings.noTimeOut) {
          gameState.timeElapsedForThisInput++;
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
            gameState.timeElapsedForThisInput <
          1
        ) {
          display.update({ gameState, settings, state: 'maxTimeReached' });
          if (!settings.runWithoutArduino) {
            johnnyFiveObjects.digitalReadout1.print('0000');
            johnnyFiveObjects.digitalReadout2.print('0000');
          }
          gameState.loopState = 'gameOver';
        } else {
          gameState.clockUpdate = updateDigitalReadouts({
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
        data: { score: gameState.gameStats.score },
      });
      playSound({ sound: settings.soundFilenames.gameOver, settings });
      // TODO: Add inputs that were not recorded (failed) yet to gameState.gameStats.gamePlayStats
      for (const [key, value] of Object.entries(settings.stations)) {
        if (!value.done) {
          // If it was done, it would be recorded already
          gameState.gameStats.gamePlayStats.push({
            station: key,
            input: value.inputs[value.newInput].funName,
            timeElapsed: gameState.timeElapsedForThisInput,
            success: 0,
          });
        }
      }
      // TODO: Update other gameState.gameStats fields
      gameState.gameStats.endTime = Date.now();
      // TODO: Set the gamestats variable to be returned to this data so it will get written to the DB.
      gameState.loopState = 'waitingForReset';
      gamePlayStats = gameState.gameStats;
      break;
    case 'waitingForReset':
      // eslint-disable-next-line no-case-declarations
      let allStationsDisarmed = true;
      for (const [, value] of Object.entries(settings.stations)) {
        if (value.armed) {
          allStationsDisarmed = false;
        }
      }
      if (allStationsDisarmed) {
        gameState.loopState = 'intro';
      }
      break;
    default:
      display.update({ gameState, settings, state: 'crash', data: '' });
      break;
  }
  return gamePlayStats;
}

export default primaryGameLoop;
