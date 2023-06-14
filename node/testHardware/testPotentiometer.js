/* eslint-disable no-await-in-loop */
import five from 'johnny-five';
import getsettings from '../utilities/getsettings.js';

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

  // https://johnny-five.io/examples/potentiometer/
  // Wire the left and right sides of the potentiometer to ground and 5 volts, one to each side,
  // it doesn't matter which, but reversiing it will reverse the direction of travel for the output.
  // Then wire the center post on the potentiometer to an analog pin on the Arduino.
  // The pin must ben analog pin, like A0 or A13

  // https://johnny-five.io/examples/potentiometer/
  const potentiometer = new five.Sensor({
    pin: 'A0',
    threshold: 25, // This will emit a 'change' if it changes by this much.
    // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
  });

  potentiometer.on("change", () => {
    const {value, raw} = potentiometer;
    console.log("Sensor: ");
    console.log("  value  : ", value);
    console.log("  raw    : ", raw);
    console.log("-----------------");
  });
});
