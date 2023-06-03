import display from './display.js';
import primaryGameLoop from './primaryGameLoop.js';
import settings from './settings.js';
import UsbDevice from './UsbDevice.js';

console.log(settings);

const stationOneLcdPort = new UsbDevice(
  settings.stationOneLcdPort.string,
  settings.stationOneLcdPort.location,
);
const stationTwoLcdPort = new UsbDevice(
  settings.stationTwoLcdPort.string,
  settings.stationTwoLcdPort.location,
);
const primaryJohnnyFiveArduinoPort = new UsbDevice(
  settings.primaryJohnnyFiveArduinoPort.string,
  settings.primaryJohnnyFiveArduinoPort.location,
);

// NOTE: The LCD screens are set by their USB location, so plugging them in differently will cause them to get lost. The LCD screens have no serial numbers, so it is the only reliable way.
settings.stationOneLcdPort.name = await stationOneLcdPort.findDeviceName();
settings.stationTwoLcdPort.name = await stationTwoLcdPort.findDeviceName();
display.initialize();

// The Arduino FTDI chips DO have serial numbers on them, so they can be reliably found no matter where they are plugged in as long as the correct serial number is in settings.js
settings.primaryJohnnyFiveArduinoPort.name =
  await primaryJohnnyFiveArduinoPort.findDeviceName();
primaryGameLoop();
