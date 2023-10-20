import five from 'johnny-five';

const displays = [
  {
    id: 'one',
    port: '/dev/ttyACM3',
    repl: false,
  },
  {
    id: 'two',
    port: '/dev/ttyACM0',
    repl: false,
  },
];

const boards = new five.Boards(displays);

boards.on('ready', async () => {
  // This is only here to demonstrate that both boards work
  const boardOneLED = new five.Led({ board: boards.byId('one'), pin: 13 });
  boardOneLED.blink(500);

  // This is only here to demonstrate that both boards work
  const boardTwoLED = new five.Led({ board: boards.byId('two'), pin: 13 });
  boardTwoLED.blink(500);

  // Only the first one will work, the second one added will not.
  // Reverse their order to demonstrate.
  const boardOneDigits = new five.Led.Digits({
    controller: 'HT16K33',
    board: boards.byId('one'),
    address: 112,
  });
  const boardTwoDigits = new five.Led.Digits({
    controller: 'HT16K33',
    board: boards.byId('two'),
    address: 112,
  });

  boardOneDigits.on();
  boardOneDigits.print('1111');
  boardTwoDigits.on();
  boardTwoDigits.print('2222');

  process.on('SIGINT', () => {
    console.log('Turning off displays.');
    boardOneDigits.off();
    boardTwoDigits.off();
  });
});
