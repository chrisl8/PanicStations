import pad from '../include/pad.js';

function updateDigitalReadouts({ gameState, settings, johnnyFiveObjects }) {
  const output = pad(
    gameState.maxTime * (1000 / settings.loopTime) -
      gameState.timeElapsedForThisInput || 0,
    4,
  );
  for (const [key] of Object.entries(settings.stations)) {
    if (johnnyFiveObjects.hasOwnProperty(`${key}-digialReadout`)) {
      johnnyFiveObjects[`${key}-digialReadout`].print(output);
    }
  }
}

export default updateDigitalReadouts;
