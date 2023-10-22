import five from 'johnny-five';
import wait from '../include/wait.js';
import UsbDevice from '../UsbDevice.js';

// This is a copy of code within gameFunctions/initializeHardware.js
// meant for testing how to build new code

const settings = {
  arduinoBoards: {
    one: {
      location: 'ID_SERIAL_SHORT',
      string: '55735303434351E090B0',
      ready: false,
    },
  },
  stations: {
    one: {
      arduinoBoard: 'one',
      hasDigitalReadout: true,
    },
    two: {
      arduinoBoard: 'one',
      hasDigitalReadout: true,
    },
  },
};

const ports = [];

for (const [key, value] of Object.entries(settings.arduinoBoards)) {
  const device = new UsbDevice(value.string, value.location);
  // eslint-disable-next-line no-await-in-loop
  const port = await device.findDeviceName();

  ports.push({
    id: key,
    port,
    repl: false,
    debug: false,
  });
}

const digitalReadouts = {};

const boards = new five.Boards(ports);

boards.on('ready', async () => {
  for (const port of ports) {
    // Blink LED just to prove that we are successfully talking to the Arduino
    const led = new five.Led({ board: boards.byId(port.id), pin: 13 });
    led.blink(500);
  }

  for (const [key, value] of Object.entries(settings.stations)) {
    // http://johnny-five.io/api/led.digits/
    digitalReadouts[key] = new five.Led.Digits({
      controller: 'HT16K33',
      board: boards.byId(value.arduinoBoard),
    });

    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
    digitalReadouts[key].on();
    digitalReadouts[key].print(key);
    console.log(
      value.arduinoBoard,
      digitalReadouts[key].id,
      boards.byId(value.arduinoBoard).port,
      key,
      'ON',
    );
  }

  await wait(4000);

  for (const [key, value] of Object.entries(settings.stations)) {
    if (digitalReadouts.hasOwnProperty(key)) {
      digitalReadouts[key].off();
      // eslint-disable-next-line no-await-in-loop
      await wait(1000);
      console.log(
        key,
        digitalReadouts[key].id,
        boards.byId(value.arduinoBoard).port,
        key,
        'OFF',
      );
    }
  }

  await wait(1000);

  process.exit();
});
