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
    if (value.isActiveInThisGameRound) {
      // Clear all inputs
      // eslint-disable-next-line no-loop-func
      value.inputs.forEach((input) => {
        input.hasBeenPressed = false;
        input.correct = false;
      });

      if (!value.recentInputList) {
        // The recentInputList prevents repeating of recent inputs when selecting new inputs randomly,
        // because true random often has long chains of repeats, which is not perceived as
        // random to humans, and is not fun either.

        // Start with an empty array, which means it will not be used at all.
        value.recentInputList = [];

        // Calculate the length of recentInputList based on the number of inputs on this station.
        // The Arming switch won't count, so start with length - 1;
        const inputCount = value.inputs.length - 1;

        // If there is 1 input, this is obviously pointless.
        // If there are only 2, this would just result in a clear alternation, and some repeats would be more random.
        // So only do this with 3 or more inputs.
        if (inputCount > 2) {
          // We will remember 20% of the inputs to prevent repeats.
          // And round it UP to the next integer
          const recentInputMemoryLength = Math.ceil(inputCount * 0.2);
          value.recentInputList = Array(recentInputMemoryLength).fill(0);
        }
      }

      // Find a random numbered input within range of the input list and not in the recently used list.
      let newInput;
      do {
        newInput = getRandomInt(1, value.inputs.length - 1);
      } while (
        value.recentInputList.length > 0 &&
        value.recentInputList.indexOf(newInput) !== -1
      );
      value.recentInputList.push(newInput);
      value.recentInputList.shift();

      let knobDirection;
      let displayName = value.inputs[newInput].label;
      value.inputs[newInput].correct = true;

      if (value.inputs[newInput].type === 'button') {
        displayName = value.inputs[newInput].label;
      } else if (value.inputs[newInput].type === 'switch') {
        if (value.inputs[newInput].currentStatus === 'on') {
          displayName = `Turn ${value.inputs[newInput].label} Off.`;
        } else {
          displayName = `Turn ${value.inputs[newInput].label} ON.`;
        }
      } else if (value.inputs[newInput].type === 'knob') {
        knobDirection = getRandVector();
        while (
          knobDirection === getRange(value.inputs[newInput].currentStatus)
        ) {
          knobDirection = getRandVector();
        }
        displayName = `Set ${value.inputs[newInput].label} to ${value.inputs[newInput][knobDirection]}`;
      }

      value.displayName = displayName;
      value.requiredKnobPosition = knobDirection;
      value.newInput = newInput;

      display.update({
        gameState,
        settings,
        operation: 'newInput',
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
let previousGameLoopState;
async function primaryGameLoop({ settings, gameState, johnnyFiveObjects }) {
  let gamePlayStats;
  if (settings.debug && gameState.loopState !== previousGameLoopState) {
    console.log(`GameLoop State: ${gameState.loopState}`);
    previousGameLoopState = gameState.loopState;
  }
  switch (gameState.loopState) {
    case 'intro':
      // This is just the "kick off" section.
      // It doesn't really do anything other than
      // move the game into the 'waitingForPlayers' section.
      display.update({ gameState, settings, operation: 'intro', data: {} });
      // eslint-disable-next-line no-case-declarations
      let anyStationArmed = false;
      for (const [, value] of Object.entries(settings.stations)) {
        if (value.armed) {
          anyStationArmed = true;
        }
      }
      if (anyStationArmed) {
        gameState.loopState = 'waitingForPlayers';
      }
      break;
    case 'waitingForPlayers': {
      let allStationsAreGo = true;
      let atLeastOneStationArmed = false; // If all stations disarm, we fall back to the 'intro' section.
      for (const [key, value] of Object.entries(settings.stations)) {
        // This will track the "in game" status of this station throughout the round.
        // In case the station becomes disarmed by mistake or on purpose during the game,
        // we won't entirely lose track of its input status.
        // We can decide how to deal with a station that disarms mid-game later, but at least now
        // we will know about it.
        value.isActiveInThisGameRound = value.armed;
        if (value.armed) {
          atLeastOneStationArmed = true;
          const startButtonIndex = settings.stations[key].inputs.findIndex(
            (x) => x.id === settings.stations[key].startGameButtonId,
          );
          if (startButtonIndex > -1) {
            if (
              !settings.stations[key].inputs[startButtonIndex].hasBeenPressed
            ) {
              allStationsAreGo = false;
              // Set Display telling the user which button to push to start this game round.
              value.lcdDisplayText = `When all players have armed, press ${settings.stations[key].inputs[startButtonIndex].label} to begin`;
              display.update({
                gameState,
                settings,
                operation: 'useStationText',
                data: { station: key },
              });
            } else {
              value.lcdDisplayText = `Waiting for other players to press their "start" button`;
              display.update({
                gameState,
                settings,
                operation: 'useStationText',
                data: { station: key },
              });
            }
          } else {
            allStationsAreGo = false;
            console.error(`Station ${key} has no startButtonIndex.`);
          }
        }
      }

      if (!atLeastOneStationArmed) {
        gameState.loopState = 'intro';
      } else if (allStationsAreGo) {
        gameState.loopState = 'startNewGame';
      }
      break;
    }
    case 'startNewGame':
      // Reset all global game state values
      gameState.timeElapsedForThisInput = 0;
      gameState.maxTime = settings.initialTime;
      gameState.gameStats = {
        score: 0,
        startedTime: Date.now(),
        gamePlayStats: [],
      };

      // Reset all per-station state
      for (const [key, value] of Object.entries(settings.stations)) {
        value.done = false;
        if (!value.isActiveInThisGameRound) {
          // Put some text on the non-participating stations
          value.lcdDisplayText = `This station is out of service until this round is over`;
          display.update({
            gameState,
            settings,
            operation: 'useStationText',
            data: { station: key },
          });
        }
      }
      display.update({
        gameState,
        settings,
        operation: 'notStarted',
        data: {},
      });
      generateNextInput({ settings, gameState });
      gameState.loopState = 'gameInProgress';
      break;
    case 'gameInProgress':
      // TODO: Allow "async" completion of inputs.
      for (const [key, value] of Object.entries(settings.stations)) {
        if (value.isActiveInThisGameRound) {
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
                input: value.inputs[value.newInput].label,
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
                operation: 'newInput',
                data: { station: key },
              });
            }
          }
        }
      }

      // eslint-disable-next-line no-case-declarations
      let allStationsDone = true;
      for (const [, value] of Object.entries(settings.stations)) {
        if (value.isActiveInThisGameRound && !value.done) {
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
          if (value.isActiveInThisGameRound && value.done) {
            display.update({
              gameState,
              settings,
              operation: 'stationDone',
              data: { station: key },
            });
          }
        }
        if (
          gameState.maxTime * (1000 / settings.loopTime) -
            gameState.timeElapsedForThisInput <
          1
        ) {
          display.update({
            gameState,
            settings,
            operation: 'maxTimeReached',
            data: {},
          });
          for (const [key] of Object.entries(settings.stations)) {
            if (johnnyFiveObjects.hasOwnProperty(`${key}-digitalReadout`)) {
              johnnyFiveObjects[`${key}-digitalReadout`].print('0000');
            }
          }
          gameState.loopState = 'gameOver';
        } else {
          updateDigitalReadouts({
            gameState,
            settings,
            johnnyFiveObjects,
          });
        }
      }
      break;
    case 'gameOver':
      if (settings.debug) {
        console.log('GAME OVER!');
      }
      // TODO: If the station was disarmed during the game, we never get to see this.
      // TODO: Maybe a timer where this displays no matter what for a moment?
      display.update({
        gameState,
        settings,
        operation: 'gameOver',
        data: { score: gameState.gameStats.score },
      });
      playSound({ sound: settings.soundFilenames.gameOver, settings });
      // TODO: Add inputs that were not recorded (failed) yet to gameState.gameStats.gamePlayStats
      for (const [key, value] of Object.entries(settings.stations)) {
        if (value.isActiveInThisGameRound && !value.done) {
          // If it was done, it would be recorded already
          gameState.gameStats.gamePlayStats.push({
            station: key,
            input: value.inputs[value.newInput].label,
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
      for (const [key, value] of Object.entries(settings.stations)) {
        if (value.armed) {
          allStationsDisarmed = false;
        } else {
          // Change text on disarmed stations now to indicate waiting on other stations.
          value.lcdDisplayText = `Disarm other stations to reset and start another round`;
          display.update({
            gameState,
            settings,
            operation: 'useStationText',
            data: { station: key },
          });
        }
      }
      if (allStationsDisarmed) {
        updateDigitalReadouts({
          gameState,
          settings,
          johnnyFiveObjects,
        });
        gameState.loopState = 'intro';
      }
      break;
    case 'randomFlashingLights': {
      // TODO: Pick a random LED on the board, and perform an random action.
      //       I think each game loop should just operate on ONE LED, not all of them.
      //       Johnny-Five LED methods:
      //       http://johnny-five.io/api/led/

      // Create a list of all LEDs so we can pick one
      const ledList = [];
      for (const [key, value] of Object.entries(settings.stations)) {
        for (const input of value.inputs) {
          if (input.ledPin) {
            const inputWithStation = { ...input };
            inputWithStation.station = key;
            ledList.append(inputWithStation);
          }
        }
      }

      const ledListEntry = getRandomInt(0, ledList.length - 1);
      const led = ledList[ledListEntry];

      if (
        johnnyFiveObjects.hasOwnProperty(
          `${led.key}-${led.type}-${led.subType}-${led.id}-led`,
        )
      ) {
        johnnyFiveObjects[
          `${led.key}-${led.type}-${led.subType}-${led.id}-led`
        ].toggle();
      }

      break;
    }
    default:
      display.update({ gameState, settings, operation: 'crash', data: {} });
      break;
  }
  return gamePlayStats;
}

export default primaryGameLoop;
