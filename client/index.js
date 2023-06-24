/* eslint-disable no-await-in-loop */
import display from './display.js';
import primaryGameLoop from './primaryGameLoop.js';
import loadSettings from './include/loadSettings.js';
import wait from './include/wait.js';
import initializeHardware from './gameFunctions/initializeHardware.js';
import storeGamePlayStats from './utilities/storeGamePlayStats.js';
import ServerConnection from './utilities/serverConnection.js';

const settings = await loadSettings();
if (!settings) {
  console.error(
    `You MUST create a settings.json5 in the parent folder of index.js.`,
  );
  console.error(`You can find examples in the exampleSettings/ folder.`);
  process.exit(1);
}

const gameState = {
  loopState: 'intro',
  maxTime: 10,
  clockUpdate: 0, // Used to regulate update of the clock, so we don't spam it and slow down the game
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

// Connect to the server it it exists
let server;
if (settings.server) {
  server = new ServerConnection({ settings, messageHandler: console.log });
  server.start({ settings });
}

// Game Update loop.
while (!gameState.shutdownRequested) {
  const gamePlayStats = await primaryGameLoop({
    settings,
    gameState,
    johnnyFiveObjects,
  });
  if (server) {
    server.sendAllStationData({ settings });
  }
  if (gamePlayStats) {
    await storeGamePlayStats({ settings, gamePlayStats });
  }
  await wait(settings.loopTime);
}
