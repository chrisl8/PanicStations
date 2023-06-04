/* eslint-disable no-await-in-loop */
import display from './display.js';
import primaryGameLoop from './primaryGameLoop.js';
import UsbDevice from './UsbDevice.js';
import loadSettings from './include/loadSettings.js';
import wait from './include/wait.js';
import initializeHardware from './gameFunctions/initializeHardware.js';

const settings = await loadSettings();
if (!settings) {
  console.error(
    `You MUST create a settings.json5 in the parent folder of index.js.`,
  );
  console.error(`You can find examples in the exampleSettings/ folder.`);
  process.exit(1);
}

// TODO: This should be a bit more dynamically generated as it is largely based on a static 2 panel game.
const gameState = {
  atGameIntro: true,
  gameStarted: false,
  gameOver: false,
  boardInitiated: false,
  waitingForInput: false,
  nextInstructionForSide1: 1,
  nextInstructionForSide2: 1,
  totalStationCount: 2, // A typical TARDIS would have 5, or 4 if one station is used for, say a computer running Spotify.
  stationsArmed: 2, // TODO: Make this variable, either by menu, or setting up a way to start game play without arming all stations.
  stationsInPlay: [], // Hold station data
  instructionsForStations: [],
  requiredKnobPosition1: null,
  requiredKnobPosition2: null,
  displayNameForStation1: '',
  displayNameForStation2: '',
  score: 0,
  recentInputList: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ], // Make this longer or shorter to reject a longer list of recent inputs
  timeElapsed: 0,
  maxTime: 10,
  clockUpdate: 0, // Used to regulate update of the clock, so we don't spam it and slow down the game
  player1done: false,
  player2done: false,
  statistics: [],
  shutdownRequested: false,
};

// Initialize LCD and Blessed based (screen) Displays
await display.initialize(settings);

// Initialize Arduino boards with Johnny-Five
const johnnyFiveObjects = await initializeHardware({
  settings,
  gameState,
});

// Wait for hardware to be initialized.
while (!gameState.hardwareInitialized) {
  await wait(250);
}

// Game Update loop.
while (!gameState.shutdownRequested) {
  await primaryGameLoop({ settings, gameState, johnnyFiveObjects });
  await wait(settings.loopTime);
}
