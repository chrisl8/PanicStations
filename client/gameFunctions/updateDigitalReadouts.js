import pad from '../include/pad.js';

function updateDigitalReadouts({ gameState, settings, johnnyFiveObjects }) {
  let clockUpdate = gameState.clockUpdate;
  if (gameState.clockUpdate > 5 && !settings.runWithoutArduino) {
    const output = pad(
      gameState.maxTime * (1000 / settings.loopTime) -
        gameState.timeElapsedForThisInput || 0,
      4,
    );
    // TODO: This must be set to a per station item.
    /*
    johnnyFiveObjects.digitalReadout1.print(output);
    johnnyFiveObjects.digitalReadout2.print(output);\
     */
    clockUpdate = 0;
  } else {
    clockUpdate++;
  }
  return clockUpdate;
}

export default updateDigitalReadouts;
