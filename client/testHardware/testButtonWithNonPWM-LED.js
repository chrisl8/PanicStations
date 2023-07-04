import five from 'johnny-five';

const board = new five.Board({
  port: 'COM7',
  repl: false, // IF you don't want the REPL to display, because maybe you are doing something else on the terminal, turn it off this way.
  debug: true, // Same for the "debug" messages like board Found and Connected.
});

board.on('ready', async () => {
  // NOTE: If we name the FILE we load to each Arduino differently,
  // then we can use THIS below to differentiate them, regardless of what port each is plugged in to or initializes first.
  // https://stackoverflow.com/a/34713418/4982408
  // console.log(board.io.firmware.name);
  // For now though using the board serial number to get the port is working fine.

  const buttonPin = 6;
  const ledPin = 22;

  // Only PWM capable pins can be Anode LEDs,
  // but all digital pins can run normal LEDs.
  const LED = new five.Led(ledPin);
  LED.on();

  const button = new five.Button({
    pin: buttonPin,
    isPullup: true,
  });
  button.on('press', () => {
    console.log(`Pressed`);
    LED.on();
  });
  button.on('hold', () => {
    console.log(`HOLD`);
  });
  button.on('release', () => {
    console.log(`Released`);
    LED.off();
  });
});
