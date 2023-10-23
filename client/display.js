/* eslint-disable no-param-reassign */
import screen from './displayScreen.js';
import DisplayLCD from './displayLCD.js';
import UsbDevice from './UsbDevice.js';

/**
 * @param {Object} settings
 */
async function initialize(settings) {
  if (settings.useScreen) {
    screen.initialize({ settings });
  }
  for (const [key, value] of Object.entries(settings.stations)) {
    if (value.hasOwnProperty('lcdPort')) {
      const port = new UsbDevice(value.lcdPort.string, value.lcdPort.location);
      // NOTE: The LCD screens are set by their USB location, so plugging them in differently will cause them to get lost. The LCD screens have no serial numbers, so it is the only reliable way.
      try {
        // eslint-disable-next-line no-await-in-loop
        value.lcdPort.name = await port.findDeviceName();
        value.lcdPort.lcd = new DisplayLCD(value.lcdPort.name);
      } catch (e) {
        console.error(
          `Station ${key} has an lcdPort listed in the settings.json5 file, but an LCD screen was not found on any visible USB device.\n${e}`,
        );
        process.exit(1);
      }
      // eslint-disable-next-line no-await-in-loop
      await value.lcdPort.lcd.initialize({ settings, lcdPort: value.lcdPort });
    }
  }
}

/**
 * @param {String} operation
 * @param {Object} data
 * @param {Object} settings
 * @param {Object} gameState
 */
function update({ gameState, operation, data, settings }) {
  for (const [key, value] of Object.entries(settings.stations)) {
    if (
      value.hasOwnProperty('lcdPort') &&
      (!data || !data.hasOwnProperty('station') || data.station === key)
    ) {
      value.lcdPort.lcd.update({
        operation,
        data,
        gameState,
        stationData: value,
      });
    }
  }
  if (settings.useScreen) {
    screen.update({ state: operation, data, settings });
  }
}

export default {
  initialize,
  update,
};
