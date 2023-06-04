import display from './display.js';
import primaryGameLoop from './primaryGameLoop.js';
import UsbDevice from './UsbDevice.js';
import loadSettings from './loadSettings.js';

let settings = await loadSettings();
if (!settings) {
  console.error(
    `You MUST create a settings.json5 in the parent folder of index.js.`,
  );
  console.error(`You can find examples in the exampleSettings/ folder.`);
  process.exit(1);
}

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
settings = await display.initialize(settings);

// The Arduino FTDI chips DO have serial numbers on them, so they can be reliably found no matter where they are plugged in as long as the correct serial number is in the settings file.
settings.primaryJohnnyFiveArduinoPort.name =
  await primaryJohnnyFiveArduinoPort.findDeviceName();

await primaryGameLoop(settings);
