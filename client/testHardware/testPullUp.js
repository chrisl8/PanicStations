import five from 'johnny-five';
import pad from '../include/pad.js';

const board = new five.Board({
  port: 'COM6',
  repl: false, // IF you don't want the REPL to display, because maybe you are doing something else on the terminal, turn it off this way.
  debug: true, // Same for the "debug" messages like board Found and Connected.
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

  const pinsToMonitor = [6, 7, 8];
  const isPullup = true;

  console.log('Setting up pins:');
  pinsToMonitor.forEach((pin) => {
    console.log(pad(pin, 2));
    const johnnyFiveObject = new five.Button({
      pin,
      isPullup,
    });
    johnnyFiveObject.on('press', () => {
      console.log(`${pin} - Pressed`);
    });
    johnnyFiveObject.on('hold', () => {
      console.log(`${pin} - HOLD`);
    });
    johnnyFiveObject.on('release', () => {
      console.log(`${pin} - Released`);
    });
  });
});
