import pad from '../include/pad.js';

function updateDigitalReadout({ gameState, settings, johnnyFiveObjects }) {
  let clockUpdate = gameState.clockUpdate;
  if (gameState.clockUpdate > 5 && !settings.runWithoutArduino) {
    const output = pad(
      gameState.maxTime * (1000 / settings.loopTime) - gameState.timeElapsed,
      4,
    );
    johnnyFiveObjects.digitalReadout1.print(output);
    johnnyFiveObjects.digitalReadout2.print(output);
    clockUpdate = 0;
  } else {
    clockUpdate++;
  }
  return clockUpdate;
}

export default updateDigitalReadout;
