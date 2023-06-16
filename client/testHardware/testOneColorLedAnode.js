/* eslint-disable no-await-in-loop */
import five from 'johnny-five';
import getsettings from '../utilities/getsettings.js';
import wait from '../include/wait.js';

const settings = await getsettings();

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

  /*
  Johnny-five only allows using ground to control an LED for RGB LEDs,
  but if you want to wire an LED with only one pin (one color),
  but use the ground to turn it on, then you have to just use a
  "bare pin".
   */

  // https://johnny-five.io/examples/led/
  // I cannot find it in the instructions, but you can pass an entire
  // object to Led. Dig in the johnny-five source code to see.
  const LED = new five.Led({ pin: 7, isAnode: true });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log('ON');
    LED.on();
    await wait(500);
    console.log('off');
    LED.off();
    await wait(500);
  }
});
