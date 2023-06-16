import five from 'johnny-five';
import wait from '../include/wait.js';
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

  // http://johnny-five.io/api/led.digits/
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
  console.log('Digital Readout: ABCD');
  digitalReadout.print('ABCD');
  await wait(5000);
  let startingNumber = 1000;
  console.log(`Digital Readout: Countdown from ${startingNumber} to 0`);
  while (startingNumber > -1) {
    const output = pad(startingNumber, 4);
    digitalReadout.print(output);
    startingNumber--;
    // eslint-disable-next-line no-await-in-loop
    await wait(50);
  }
  await wait(5000);
  console.log('Digital Readout Brightness: 75');
  digitalReadout.brightness(75);
  await wait(5000);
  console.log('Digital Readout: Off');
  digitalReadout.off();
  await wait(5000);
  process.exit();
});
