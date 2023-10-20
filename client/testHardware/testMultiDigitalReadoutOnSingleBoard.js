import five from 'johnny-five';
import wait from '../include/wait.js';

const ports = [
  {
    id: 'one',
    output: '1111',
    port: '/dev/ttyACM3',
    repl: false,
    debug: true,
  },
  {
    id: 'two',
    output: '2222',
    port: '/dev/ttyACM0',
    repl: false,
    debug: true,
  },
];

const digitalReadouts = {};

const boards = new five.Boards(ports);

boards.on('ready', async () => {
  console.log(0);
  for (const port of ports) {
    const led = new five.Led({ board: boards.byId(port.id), pin: 13 });
    led.blink(500);

    // if (port.id === 'one') {
    // http://johnny-five.io/api/led.digits/
    digitalReadouts[port.id] = new five.Led.Digits({
      controller: 'HT16K33',
      board: boards.byId(port.id),
    });
    // } else {
    //   // http://johnny-five.io/api/led.digits/
    //   digitalReadouts[port.id] = new five.Led.Digits({
    //     board: boards.byId(port.id),
    //     pins: { data: 20, clock: 21 },
    //   });
    // }
    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
    digitalReadouts[port.id].on();
    digitalReadouts[port.id].print(port.output);
    console.log(
      port.id,
      digitalReadouts[port.id].id,
      boards.byId(port.id).port,
      port.output,
      'ON',
    );
  }
  await wait(5000);
  for (const port of ports) {
    if (digitalReadouts.hasOwnProperty(port.id)) {
      // console.log(digitalReadouts[port.id]);
      digitalReadouts[port.id].off();
      console.log(
        port.id,
        digitalReadouts[port.id].id,
        boards.byId(port.id).port,
        port.output,
        'OFF',
      );
    }
  }
  await wait(1000);
  process.exit();
  // NOTE: If we name the FILE we load to each Arduino differently,
  // then we can use THIS below to differentiate them, regardless of what port each is plugged in to or initializes first.
  // https://stackoverflow.com/a/34713418/4982408
  // console.log(board.io.firmware.name);
  // For now though using the board serial number to get the port is working fine.

  // This is just blinking an LED on the Arduino board to confirm that the Arduino connection works.
});
console.log(7);
