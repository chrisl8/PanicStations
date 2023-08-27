/* eslint-disable no-param-reassign,func-names */
import five from 'johnny-five';
import playSound from '../playSound.js';
import UsbDevice from '../UsbDevice.js';
import getRange from '../include/getRange.js';

// TODO: This is Arduino Mega specific. Does that matter?
const pwmPins = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 44, 45, 46];

const smartLedActions = ({ settings, led, action, pinSettings, value }) => {
  switch (action) {
    case 'on':
      if (settings.debug) {
        console.log(`LED pin ${pinSettings.ledPin} ON`);
      }
      if (
        pinSettings.ledIsAnode &&
        pwmPins.indexOf(pinSettings.ledPin) === -1
      ) {
        led.off();
      } else {
        led.on();
      }
      return true;
    case 'off':
      if (settings.debug) {
        console.log(`LED pin ${pinSettings.ledPin} off`);
      }
      if (
        pinSettings.ledIsAnode &&
        pwmPins.indexOf(pinSettings.ledPin) === -1
      ) {
        led.on();
      } else {
        led.off();
      }
      return true;
    case 'brightness':
      if (
        value !== undefined &&
        value !== null &&
        pwmPins.indexOf(pinSettings.ledPin) > -1
      ) {
        if (settings.debug) {
          console.log(`LED in ${pinSettings.ledPin} Brightness ${value}`);
        }
        led.brightness(value);
        return true;
      }
      return false;
    default:
      console.error(`Unknown led action: ${action}`);
      return false;
  }
};

async function initializeHardware({ settings, gameState }) {
  // TODO: There may be more than one Arduino. Two stations may share one.

  const primaryJohnnyFiveArduinoPort = new UsbDevice(
    settings.primaryJohnnyFiveArduinoPort.string,
    settings.primaryJohnnyFiveArduinoPort.location,
  );

  // The Arduino FTDI chips DO have serial numbers on them, so they can be reliably found no matter where they are plugged in as long as the correct serial number is in the getsettings file.
  settings.primaryJohnnyFiveArduinoPort.name =
    await primaryJohnnyFiveArduinoPort.findDeviceName();

  const johnnyFiveObjects = {};
  if (settings.runWithoutArduino) {
    gameState.hardwareInitialized = true;
  } else {
    const board = new five.Board({
      port: settings.primaryJohnnyFiveArduinoPort.name,
      repl: settings.johnnyFiveRepl, // IF you don't want the REPL to display, because maybe you are doing something else on the terminal, turn it off this way.
      debug: settings.johnnyFiveDebug, // Same for the "debug" messages like board Found and Connected.
    });
    // http://johnny-five.io/api/button/
    board.on('ready', () => {
      // NOTE: If we name the FILE we load to each Arduino differently,
      // then we can use THIS below to differentiate them, regardless of what port each is plugged in to or initializes first.
      // https://stackoverflow.com/a/34713418/4982408
      // console.log(board.io.firmware.name);
      // For now though using the board serial number to get the port is working fine.

      // TODO: Do we need to update/replace the firmata on either board?

      // Volume Knob
      if (settings.hasOwnProperty('volume')) {
        johnnyFiveObjects.volumeKnob = new five.Sensor({
          pin: settings.volume.knob.pin,
          threshold: settings.volume.knob.potChangeThreshold, // This will emit a 'change' if it changes by this much.
          // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
        });
        johnnyFiveObjects.volumeKnob.on('change', function () {
          // Do NOT make this an arrow function!
          // this.value must reference the this that called it!
          // Remember knob works in reverse.
          if (this.value < settings.volume.knob.maximum) {
            settings.volume.setting = settings.volume.maximum;
          } else if (this.value > settings.volume.knob.minimum) {
            settings.volume.setting = settings.volume.zero;
          } else {
            const OldRange =
              settings.volume.knob.maximum - settings.volume.knob.minimum;
            if (OldRange === 0)
              settings.volume.setting = settings.volume.minimum;
            else {
              const NewRange =
                settings.volume.maximum - settings.volume.minimum;
              settings.volume.setting = Math.round(
                ((this.value - settings.volume.knob.minimum) * NewRange) /
                  OldRange +
                  settings.volume.minimum,
              );
            }
          }
          if (settings.debug) {
            console.log(
              `\nVolume Knob (${settings.volume.knob.pin}): ${this.value} - Volume: ${settings.volume.setting}`,
            );
          }
        });
      }

      for (const [key, value] of Object.entries(settings.stations)) {
        if (value.hasDigitalReadout) {
          johnnyFiveObjects[`${key}-digialReadout`] = new five.Led.Digits({
            controller: 'HT16K33',
          });
          johnnyFiveObjects[`${key}-digialReadout`].print('0000');
        }

        // eslint-disable-next-line no-loop-func
        value.inputs.forEach((input) => {
          if (
            ['switch', 'button'].indexOf(input.type) !== -1 &&
            settings.hasOwnProperty('soundFilenames') &&
            settings.soundFilenames.hasOwnProperty('incorrect') &&
            settings.soundFilenames.hasOwnProperty('success')
          ) {
            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Button({
              pin: input.pin,
              isPullup: input.isPullup,
            });
            if (input.ledPin) {
              johnnyFiveObjects[
                `${key}-${input.type}-${input.subType}-${input.id}-led`
              ] = new five.Led({
                pin: input.ledPin,
                isAnode: input.ledIsAnode && pwmPins.indexOf(input.ledPin) > -1,
              });
              // Initialize LEDs as off.
              smartLedActions({
                settings,
                led: johnnyFiveObjects[
                  `${key}-${input.type}-${input.subType}-${input.id}-led`
                ],
                action: 'off',
                pinSettings: input,
              });
            }
            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ].on('press', () => {
              input.initialized = true;
              input.hasBeenPressed = true;
              const previousStatus = input.currentStatus;
              input.currentStatus = 'on';
              let soundName = settings.soundFilenames.incorrect;
              if (input.correct) {
                soundName = settings.soundFilenames.success;
                if (input.subType === 'big') {
                  soundName = settings.soundFilenames.bigButton;
                }
              }
              if (input.ledPin) {
                // TODO: More nuanced control of LED based on various things.
                smartLedActions({
                  settings,
                  led: johnnyFiveObjects[
                    `${key}-${input.type}-${input.subType}-${input.id}-led`
                  ],
                  action: 'on',
                  pinSettings: input,
                });
              }
              // TODO: Somehow fix the spamming of the sound when turning the Arming switch off.
              // TODO: The LCD screen should say when it is waiting for OTHER stations to disarm after THIS station is disarmed.
              if (input.subType === 'arm') {
                soundName = settings.soundFilenames.armingSwitch;
                // Clear Start Game Button just in case it was pressed while game was not going
                if (
                  settings.stations[key].hasOwnProperty('startGameButtonId')
                ) {
                  const startButtonIndex = settings.stations[
                    key
                  ].inputs.findIndex(
                    (x) => x.id === settings.stations[key].startGameButtonId,
                  );
                  if (startButtonIndex > 0) {
                    console.log(
                      settings.stations[key].inputs[startButtonIndex].label,
                      settings.stations[key].inputs[startButtonIndex]
                        .hasBeenPressed,
                    );
                    settings.stations[key].inputs[
                      startButtonIndex
                    ].hasBeenPressed = false;
                  } else {
                    console.error(
                      `Input ID ${settings.stations[key].startGameButtonId}, which is the startGameButtonId is missing from station ${key}!`,
                    );
                  }
                } else {
                  console.error(
                    `No startGameButtonId was set for station ${key}!`,
                  );
                }

                settings.stations[key].armed = true;
                if (settings.debug) {
                  console.log(`Station ${key} ARMED!`);
                }
              }
              if (settings.debug) {
                console.log(`Play Sound: ${soundName}`);
                console.log(`Station ${key} | ${input.label} ON`);
              }
              if (
                gameState.loopState === 'gameInProgress' ||
                input.subType === 'arm'
              ) {
                playSound({ sound: soundName, settings });
              } else if (
                input.currentStatus !== previousStatus &&
                settings.soundFilenames.hasOwnProperty('random') &&
                Array.isArray(settings.soundFilenames.random) &&
                settings.soundFilenames.random.length > 1
              ) {
                // Switches tend to throw a lot of "on" status all at once and repeat the sound,
                // so the check against previousStatus fixes that.
                // TODO: Actually, I'm not sure that is true. The sound may just repeat in the wav file xD  Maybe undo this if that isn't the case.

                // Play random sound when game isn't running.
                // TODO: Improve on this and/or make a function.
                // It would be better if the same button played the same sound,
                // each time.
                // Add an "idleSound" key to each input, and use that sound name,
                // or if it doesn't exist on an entry, then go for "random".
                let randomSound = settings.soundFilenames.random[1];
                if (input.type === 'button') {
                  randomSound = settings.soundFilenames.random[0];
                }
                // const randomSound =
                //   getsettings.soundFilenames.random[
                //     Math.floor(
                //       Math.random() * getsettings.soundFilenames.random.length,
                //     )
                //   ];
                if (settings.debug) {
                  console.log(`Random Sound: ${randomSound}`);
                }
                playSound({ sound: randomSound, settings });
              }
            });
            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ].on('hold', () => {
              input.initialized = true;
              input.currentStatus = 'on';
            });
            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ].on('release', () => {
              input.initialized = true;
              input.hasBeenPressed = true;
              input.currentStatus = 'off';
              if (settings.debug) {
                console.log(`Station ${key} | ${input.label} OFF`);
              }
              if (input.ledPin) {
                // TODO: More nuanced control of LED based on various things.
                smartLedActions({
                  settings,
                  led: johnnyFiveObjects[
                    `${key}-${input.type}-${input.subType}-${input.id}-led`
                  ],
                  action: 'off',
                  pinSettings: input,
                });
              }
              if (input.subType === 'arm') {
                settings.stations[key].armed = false;
                if (settings.debug) {
                  console.log(`Station ${key} DIS-armed.`);
                }
              }
              if (
                input.type === 'switch' &&
                gameState.loopState === 'gameInProgress'
              ) {
                let soundName = settings.soundFilenames.incorrect;
                if (input.correct) {
                  soundName = settings.soundFilenames.success;
                }
                playSound({ sound: soundName, settings });
              }
            });
          } else if (input.type === 'knob') {
            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Sensor({
              pin: input.pin,
              threshold: settings.potChangeThreshold, // This will emit a 'change' if it changes by this much.
              // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
            });

            if (input.ledPin) {
              johnnyFiveObjects[
                `${key}-${input.type}-${input.subType}-${input.id}-led`
              ] = new five.Led({
                pin: input.ledPin,
                isAnode: input.ledIsAnode && pwmPins.indexOf(input.ledPin) > -1,
              });
              // Initialize LEDs as off.
              smartLedActions({
                settings,
                led: johnnyFiveObjects[
                  `${key}-${input.type}-${input.subType}-${input.id}-led`
                ],
                action: 'off',
                pinSettings: input,
              });
            }

            // Inject the `sensor` hardware into
            // the Repl instance's context;
            // allows direct command line access
            // board.repl.inject({
            //     pot: potentiometer
            // });

            // "data" get the current reading from the potentiometer
            /*
                  potentiometer.on("data", function() {
                    console.log(this.value, this.raw);
                  });
                  */

            johnnyFiveObjects[
              `${key}-${input.type}-${input.subType}-${input.id}`
            ].on('change', function () {
              // Do NOT make this an arrow function!
              // this.value must reference the this that called it!
              input.initialized = true;
              input.hasBeenPressed = true;
              input.currentStatus = this.value;
              if (settings.debug) {
                console.log(
                  `Station ${key} input ${input.label} ${getRange(this.value)}`,
                );
              }
              if (input.ledPin) {
                // TODO: More nuanced control of LED based on various things.
                let brightnessValue = (this.value * 255) / 1024;
                if (brightnessValue < 50) {
                  brightnessValue = 0;
                }
                smartLedActions({
                  settings,
                  led: johnnyFiveObjects[
                    `${key}-${input.type}-${input.subType}-${input.id}-led`
                  ],
                  action: 'brightness',
                  pinSettings: input,
                  value: brightnessValue,
                });
              }
            });
          }
          if (settings.debug) {
            // This prints out all button/switch labels at the start of the program.
            console.log(`Station ${key} input ${input.id} is ${input.label}.`);
          }
        });
      }
      gameState.hardwareInitialized = true;
    });
  }
  return johnnyFiveObjects;
}

export default initializeHardware;
