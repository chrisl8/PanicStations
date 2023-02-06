const settings = {
  loopTime: 10,
  useScreen: false,
  useLCD: true,
  debug: true, // Use this to see input on screen
  runWithoutArduino: false, // Use for debugging, otherwise always false
  potChangeThreshold: 25,
  // NOTE: These are set by their USB location, so plugging them in differently will cause them to get lost. These have no serial numbers, so it is the only reliable way.
  stationOneLcdPort: {
    location: 'ID_PATH_TAG',
    string: 'platform-3f980000_usb-usb-0_1_5_1_1_0',
  },
  stationTwoLcdPort: {
    location: 'ID_PATH_TAG',
    string: 'platform-3f980000_usb-usb-0_1_5_3_1_0',
  },
  primaryJohnnyFiveArduinoPort: {
    location: 'ID_SERIAL_SHORT',
    string: '55735303434351E090B0',
  },
  noTimeOut: false, // Give unlimited time for each input. For testing.
  soundFilenames: {
    success: '328120__kianda__powerup',
    incorrect: 'error',
    bigButton: 'theOneButton',
    armingSwitch: '369867__samsterbirdies__radio-beep',
    switchOff: '4',
    gameOver: 'lose',
    random: [
      'copyrighted/CastleInTheSky-Ding',
      'copyrighted/CastleInTheSky-Zap',
    ],
  },
  successSoundName: '328120__kianda__powerup',
  incorrectSoundName: 'error',
  bigButtonSoundName: 'theOneButton',
  armingSwitchSoundName: '369867__samsterbirdies__radio-beep',
  switchOffSoundName: '4',
  gameOverSoundName: 'lose',
  johnnyFiveRepl: false,
  johnnyFiveDebug: true,
  initialTime: 10, // How much time you start out with when the game begins.
  scoreKeeperPixelCount: 53,
  volume: {
    setting: 65,
    zero: 0,
    minimum: 0,
    maximum: 100,
    knob: {
      pin: 'A6',
      potChangeThreshold: 5,
      minimum: 1000,
      maximum: 40,
    },
  },
};

export default settings;
