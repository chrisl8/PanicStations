/* eslint-disable no-param-reassign */
import screen from './displayScreen.js';
import DisplayLCD from './displayLCD.js';
import UsbDevice from './UsbDevice.js';

async function initialize(settings) {
  if (settings.useScreen) {
    screen.initialize();
  }
  if (settings.useLCD) {
    for (const [, value] of Object.entries(settings.stations)) {
      const port = new UsbDevice(value.lcdPort.string, value.lcdPort.location);

      // NOTE: The LCD screens are set by their USB location, so plugging them in differently will cause them to get lost. The LCD screens have no serial numbers, so it is the only reliable way.
      // eslint-disable-next-line no-await-in-loop
      value.lcdPort.name = await port.findDeviceName();
      value.lcdPort.lcd = new DisplayLCD(value.lcdPort.name);
      // eslint-disable-next-line no-await-in-loop
      await value.lcdPort.lcd.initialize();
    }
  }
}

/**
 * @param {String} state
 * @param {String} data
 * @param {Object} settings
 * @param {Object} gameState
 */
function update({ gameState, state, data, settings }) {
  if (settings.useLCD) {
    for (const [key, value] of Object.entries(settings.stations)) {
      value.lcdPort.lcd.update({ state, data, station: key, gameState });
    }
  }
  if (settings.useScreen) {
    screen.update({ state, data });
  }
}

export default {
  initialize,
  update,
};
