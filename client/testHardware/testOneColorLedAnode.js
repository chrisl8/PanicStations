/* eslint-disable no-await-in-loop */
import five from 'johnny-five';
import getsettings from '../utilities/getsettings.js';
import wait from '../include/wait.js';

const settings = await getsettings();

const board = new five.Board({
  port: 'COM7',
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

  /*
  For "isAnode" LEDs, the crash does not happen at initialization,
  but when LED.on/off is attempted.
   */

  // https://johnny-five.io/examples/led/
  // I cannot find it in the instructions, but you can pass an entire
  // object to Led. Dig in the johnny-five source code to see.

  /*
  Some rules:
  Only PWM pins, which are 2-13 and 44-46 (15 pins) can be used for isAnode = true.
  Only PWM pins, which are 2-13 and 44-46 (15 pins) can be used with .brightness().
  IF you use an anode LED on a non-PWM pin, you must NOT set isAnode = true,
  and you must then reverse the ON/Off logic.
   */

  // Input for LED, i.e. What would be in settings file:
  const pinSettings = {
    pin: 4,
    isAnode: true,
  };

  const pwmPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46];

  /**
   * Act on LEDs with intelligence based on knowledge of Arduino pin capabilities
   * @param {Object} led
   * @param {String} action
   * @param {Object} pinSettings
   * @param {Number} [value]
   */
  const smartLedActions = ({ led, action, pinSettings, value }) => {
    switch (action) {
      case 'on':
        console.log('ON');
        if (pinSettings.isAnode && pwmPins.indexOf(pinSettings.pin) === -1) {
          led.off();
        } else {
          led.on();
        }
        return true;
      case 'off':
        console.log('off');
        if (pinSettings.isAnode && pwmPins.indexOf(pinSettings.pin) === -1) {
          led.on();
        } else {
          led.off();
        }
        return true;
      case 'brightness':
        if (
          value !== undefined &&
          value !== null &&
          pwmPins.indexOf(pinSettings.pin) > -1
        ) {
          console.log(`Brightness: ${value}`);
          led.brightness(value);
          return true;
        }
        return false;
      default:
        console.error(`Unknown led action: ${action}`);
        return false;
    }
  };

  const LED = new five.Led({
    pin: pinSettings.pin,
    isAnode: pinSettings.isAnode && pwmPins.indexOf(pinSettings.pin) > -1,
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    smartLedActions({ led: LED, action: 'on', pinSettings });
    await wait(500);
    if (
      smartLedActions({
        led: LED,
        action: 'brightness',
        pinSettings,
        value: 150,
      })
    ) {
      await wait(500);
    }
    smartLedActions({ led: LED, action: 'off', pinSettings });
    await wait(500);
  }
});
