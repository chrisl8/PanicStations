const process = require('process');
const { SerialPort } = require('serialport');
const UsbDevice = require('./UsbDevice');
const wait = require('./wait');

let working = false; // Prevent multiple instances from running at once in the same program
let displaySizeSet;

async function getPortName() {
  // NOTE: This works if you have one display, but if you have two, you might have to hard code this.
  const relayDevice = new UsbDevice('Adafruit_Industries', 'ID_MODEL');
  return relayDevice.findDeviceName();
}

// https://learn.adafruit.com/usb-plus-serial-backpack/command-reference
const commandList = {
  displayOn: 0x42,
  displayOff: 0x46,
  clear: 0x58,
  autoscrollOn: 0x51,
  autoscrollOff: 0x52,
  cursorHome: 0x48,
  cursorBack: 0x4c,
  cursorForward: 0x4d,
  underlineCursorOn: 0x4a,
  underlineCursorOff: 0x4b,
  blockCursorOn: 0x53,
  blockCursorOff: 0x54,
};

/*
 Moving and changing the cursor:
 Set cursor position - 0xFE 0x47 - set the position of text entry cursor. Column and row numbering starts with 1 so the first position in the very top left is (1, 1)
 */

function getPortObject(port) {
  return new SerialPort({
    path: port,
    baudRate: 19200,
  });
}

async function display({
  operation,
  input,
  runFromCommandLine,
  row,
  red,
  green,
  blue,
  portObj,
}) {
  const wrapUp = ({ error }) => {
    if (runFromCommandLine && error) {
      console.error(`Failed to write to port: ${error}`);
      process.exit(1);
    }
    working = false;
  };

  while (working) {
    // Wait for any existing operations to finish before running this one.
    // eslint-disable-next-line no-await-in-loop
    await wait(1);
  }
  working = true; // TODO: Do we need this?

  if (commandList.hasOwnProperty(operation)) {
    portObj.write(Buffer.from([0xfe, commandList[operation]]), (err) => {
      // Argument Options: err, result
      if (err) {
        wrapUp({
          runFromCommandLine,
          error: err,
          portObj,
        });
      } else {
        wrapUp({
          runFromCommandLine,
          portObj,
        });
      }
    });
  } else {
    switch (operation) {
      case 'text': {
        if (!displaySizeSet) {
          try {
            // Set display size
            // Note that it has to be in HEX
            // I don't know why I have to set it to 5 lines instead of 4,
            // but if I set it to 4, it only works for 3 lines.
            await portObj.write(Buffer.from([0xfe, 0xd1, 0x14, 0x05]));
          } catch (e) {
            throw e;
          }
        }
        let output = input;
        // Make input match a full line length to avoid leaving garbage behind.
        while (output.length < 19) {
          // eslint-disable-next-line no-param-reassign
          output = `${output} `;
        }

        const outputArray = [0xfe, 0x47, 1];
        switch (row) {
          case 'line2':
            outputArray.push(2);
            break;
          case 'line3':
            outputArray.push(3);
            break;
          case 'line4':
            outputArray.push(4);
            break;
          default:
            outputArray.push(1);
            break;
        }

        portObj.write(Buffer.from(outputArray), (err) => {
          // Argument Options: err, result
          if (err) {
            wrapUp({
              runFromCommandLine,
              error: err,
              portObj,
            });
          } else {
            portObj.drain(() => {
              portObj.write(output.slice(0, 20), (e) => {
                // Argument Options: err, result
                if (e) {
                  wrapUp({
                    runFromCommandLine,
                    error: e,
                    portObj,
                  });
                } else {
                  wrapUp({
                    runFromCommandLine,
                    portObj,
                  });
                }
              });
            });
          }
        });
        break;
      }
      case 'hex':
        portObj.write(Buffer.from([0xfe, input]), (err) => {
          // Argument Options: err, result
          if (err) {
            wrapUp({
              runFromCommandLine,
              error: err,
              portObj,
            });
          } else {
            wrapUp({
              runFromCommandLine,
              portObj,
            });
          }
        });
        break;
      case 'color':
        portObj.write(Buffer.from([0xfe, 0xd0, red, green, blue]), (err) => {
          // Argument Options: err, result
          if (err) {
            wrapUp({
              runFromCommandLine,
              error: err,
              portObj,
            });
          } else {
            wrapUp({
              runFromCommandLine,
              portObj,
            });
          }
        });
        break;
      case 'brightness':
        portObj.write(Buffer.from([0xfe, 0x99, input]), (err) => {
          // Argument Options: err, result
          if (err) {
            wrapUp({
              runFromCommandLine,
              error: err,
              portObj,
            });
          } else {
            wrapUp({
              runFromCommandLine,
              portObj,
            });
          }
        });
        break;
      case 'contrast':
        portObj.write(Buffer.from([0xfe, 0x50, input]), (err) => {
          // Argument Options: err, result
          if (err) {
            wrapUp({
              runFromCommandLine,
              error: err,
              portObj,
            });
          } else {
            wrapUp({
              runFromCommandLine,
              portObj,
            });
          }
        });
        break;
      default:
        wrapUp({
          runFromCommandLine,
          error: 'Unknown command.',
        });
    }
  }
}

module.exports = { display, getPortObject };

if (require.main === module) {
  (async function () {
    // Run the function if this is called directly instead of required as a module.
    if (process.argv.length < 3) {
      console.log(
        'You must provide command line parameters and operations. Here are examples:',
      );
      console.log('Display text on the screen:');
      console.log("node LCD.js text 'Test'");
      console.log('Display text on the screen and select a row:');
      console.log("node LCD.js text 'line1' line1");
      console.log("node LCD.js text 'line2' line2");
      console.log("node LCD.js text 'line3' line3");
      console.log("node LCD.js text 'line4' line4");
      console.log('Send a specific hex code command:');
      console.log('node LCD.js hex 0x58');
      console.log(
        'Change the background light color. <red> <green> <blue> are numbers from 0 to 255:',
      );
      console.log('node LCD.js color <red> <green> <blue>');
      console.log('Along with some specific commands:');
      console.log('node LCD.js displayOn');
      console.log('node LCD.js displayOff');
      console.log('node LCD.js clear');
      console.log('node LCD.js brightness <number 0 to 255>');
      console.log(
        'node LCD.js contrast <number 0 to 255> 200 seems like a good default.',
      );
      process.exit();
    }
    const operation = process.argv[2];
    let input = process.argv[3];
    let row;
    if (operation === 'text' && process.argv.length > 4) {
      row = process.argv[3];
      input = process.argv[4];
    }
    let red;
    let green;
    let blue;
    if (operation === 'color') {
      red = process.argv[3];
      green = process.argv[4];
      blue = process.argv[5];
    }
    let port;
    try {
      port = await getPortName();
    } catch (e) {
      console.error('Error getting LCD Display port:');
      console.error(e);
      process.exit(1);
    }
    console.log(port);
    try {
      const portObj = await getPortObject(port);
      await display({
        operation,
        input,
        runFromCommandLine: true,
        row,
        red,
        green,
        blue,
        portObj,
      });
    } catch (e) {
      console.error('Error writing to LCD Display:');
      console.error(e);
      process.exit(1);
    }
  })();
}
