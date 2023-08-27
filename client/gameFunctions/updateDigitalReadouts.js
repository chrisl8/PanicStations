import pad from '../include/pad.js';

function updateDigitalReadouts({ gameState, settings, johnnyFiveObjects }) {
  let clockUpdate = gameState.clockUpdate;
  if (gameState.clockUpdate > 5) {
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
    clockUpdate = 0;
  } else {
    clockUpdate++;
  }
  return clockUpdate;
}

export default updateDigitalReadouts;
