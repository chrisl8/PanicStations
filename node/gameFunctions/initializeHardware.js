/* eslint-disable no-param-reassign,func-names */
import five from 'johnny-five';
import playSound from '../playSound.js';
import UsbDevice from '../UsbDevice.js';

async function initializeHardware({ settings, gameState }) {
  // TODO: There may be more than one Arduino. Two stations may share one.

  const primaryJohnnyFiveArduinoPort = new UsbDevice(
    settings.primaryJohnnyFiveArduinoPort.string,
    settings.primaryJohnnyFiveArduinoPort.location,
  );

  // The Arduino FTDI chips DO have serial numbers on them, so they can be reliably found no matter where they are plugged in as long as the correct serial number is in the settings file.
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

      johnnyFiveObjects.digitalReadout2 = new five.Led.Digits({
        controller: 'HT16K33',
      });
      johnnyFiveObjects.digitalReadout1 = new five.Led.Digits({
        controller: 'HT16K33',
      });

      // Volume Knob
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
          if (OldRange === 0) settings.volume.setting = settings.volume.minimum;
          else {
            const NewRange = settings.volume.maximum - settings.volume.minimum;
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

      for (let i = 0; i < settings.stationList.length; i++) {
        // eslint-disable-next-line no-loop-func
        settings.stationList[i].forEach((input) => {
          if (
            ['switch', 'button'].indexOf(input.type) !== -1 &&
            settings.hasOwnProperty('soundFilenames') &&
            settings.soundFilenames.hasOwnProperty('incorrect') &&
            settings.soundFilenames.hasOwnProperty('success')
          ) {
            let isPullup = true;
            if (input.subType === 'arm') {
              isPullup = false;
            }
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Button({
              pin: input.pin,
              isPullup,
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('press', () => {
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
              if (input.subType === 'arm') {
                soundName = settings.soundFilenames.armingSwitch;
              }
              if (settings.debug) {
                console.log(`\nStation ${i + 1}`);
                console.log(input);
              }
              if (
                (gameState.gameStarted && !gameState.gameOver) ||
                input.subType === 'arm'
              ) {
                // TODO: The Arm switches tend to be flaky, maybe account for this somehow?
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
                // Add an "idleSound" key to each stationList object, and use that sound name,
                // or if it doesn't exist on an entry, then go for "random".
                let randomSound = settings.soundFilenames.random[1];
                if (input.type === 'button') {
                  randomSound = settings.soundFilenames.random[0];
                }
                // const randomSound =
                //   settings.soundFilenames.random[
                //     Math.floor(
                //       Math.random() * settings.soundFilenames.random.length,
                //     )
                //   ];
                if (settings.debug) {
                  console.log(`Random Sound: ${randomSound}`);
                }
                playSound({ sound: randomSound, settings });
              }
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('hold', () => {
              input.currentStatus = 'on';
            });
            johnnyFiveObjects[
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('release', () => {
              input.hasBeenPressed = true;
              input.currentStatus = 'off';
              if (
                input.type === 'switch' &&
                !gameState.gameOver &&
                gameState.gameStarted
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
              `${i}-${input.type}-${input.subType}-${input.id}`
            ] = new five.Sensor({
              pin: input.pin,
              threshold: settings.potChangeThreshold, // This will emit a 'change' if it changes by this much.
              // freq: 250 // This will emit data every x milliseconds, even if no change has occurred.
            });

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
              `${i}-${input.type}-${input.subType}-${input.id}`
            ].on('change', function () {
              // Do NOT make this an arrow function!
              // this.value must reference the this that called it!
              input.hasBeenPressed = true;
              input.currentStatus = this.value;
              if (settings.debug) {
                console.log(`\nStation ${i + 1}`);
                console.log(input);
              }
              // console.log(input);
            });
          }
          if (settings.debug) {
            // This prints out all button/switch labels at the start of the program.
            console.log(`Station ${i} input ${input.id} is ${input.label}.`);
          }
        });
      }
      gameState.hardwareInitialized = true;
    });
  }
  return johnnyFiveObjects;
}

export default initializeHardware;
