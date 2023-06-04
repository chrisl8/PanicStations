import screen from './displayScreen.js';
import DisplayLCD from './displayLCD.js';

let lcd1;
let lcd2;

async function initialize(settings) {
  if (settings.useScreen) {
    screen.initialize();
  }
  if (settings.useLCD) {
    lcd1 = new DisplayLCD(settings.stationOneLcdPort.name);
    lcd2 = new DisplayLCD(settings.stationTwoLcdPort.name);
    await lcd1.initialize();
    await lcd2.initialize();
  }
  return settings;
}

/** *
 * @param {String} state
 * @param {String} data
 * @param {Object} settings
 */
function update({ state, data, settings }) {
  if (settings.useLCD) {
    lcd1.update({ state, data, station: 1 });
    lcd2.update({ state, data, station: 2 });
  }
  if (settings.useScreen) {
    screen.update({ state, data });
  }
}

export default {
  initialize,
  update,
};
