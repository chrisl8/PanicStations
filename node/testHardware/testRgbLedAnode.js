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

  // https://johnny-five.io/examples/led-rgb-anode/
  const anode = new five.Led.RGB({
    // Wire anode pin to 5v via a resistor, 1000 Ohm works well,
    // then see below for the other pins, or change this code and pick different pins if you like.
    pins: {
      red: 7,
      green: 6,
      blue: 5,
    },
    isAnode: true,
  });

  // Turn it on and set the initial color
  anode.on();

  const colors = ['#FF0000', '#00FF00', '#0000FF'];
  let currentColor = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log(colors[currentColor]);
    anode.color(colors[currentColor]);
    currentColor++;
    if (currentColor > colors.length - 1) {
      currentColor = 0;
    }
    await wait(500);
  }
});
