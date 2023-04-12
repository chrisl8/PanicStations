import five from 'johnny-five';
import settings from '../settings.js';
import wait from '../wait.js';

const board = new five.Board({
  port: 'COM6',
  repl: settings.johnnyFiveRepl, // IF you don't want the REPL to display, because maybe you are doing something else on the terminal, turn it off this way.
  debug: settings.johnnyFiveDebug, // Same for the "debug" messages like board Found and Connected.
});

board.on('ready', async () => {
  // NOTE: If we name the FILE we load to each Arduino differently,
  // then we can use THIS below to differentiate them, regardless of what port each is plugged in to or initializes first.
  // https://stackoverflow.com/a/34713418/4982408
  // console.log(board.io.firmware.name);
  // For now though using the board serial number to get the port is working fine.

  // This is just blinking an LED on the Arduino board to confirm that the Arduino connection works.
  const led = new five.Led(13);
  led.blink(500);

  const digitalReadout = new five.Led.Digits({
    controller: 'HT16K33',
  });

  console.log('Digital Readout: On');
  digitalReadout.on();
  await wait(5000);
  console.log('Digital Readout: ALL Segments ON');
  digitalReadout.print('8.8.:8.8.');
  await wait(5000);
  console.log('Digital Readout Brightness: 10');
  digitalReadout.brightness(10);
  await wait(5000);
  console.log('Digital Readout Brightness: 75');
  digitalReadout.brightness(75);
  await wait(5000);
  console.log('Digital Readout: Off');
  digitalReadout.off();
  await wait(5000);
  process.exit();
});
