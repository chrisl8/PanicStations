import isEqual from 'lodash/isEqual.js';
import lcd from './LCD20x4.js';
import wait from './include/wait.js';
import formatAndSendToLCD from './formatAndSendToLCD.js';

function centerLine(text) {
  if (text.length < 20 - 1) {
    let spaces = '';
    while (spaces.length < (20 - text.length) / 2) {
      spaces = `${spaces} `;
    }
    // eslint-disable-next-line no-param-reassign
    text = `${spaces}${text}`;
  }
  return text;
}

class DisplayLCD {
  constructor(port = '/dev/ttyACM1') {
    this.port = port;
    this.lcdData = [];
  }

  /**
   * Initialize Adafruit LCD Display
   * @param {Object} settings
   * @param {Object} lcdPort
   */
  async initialize({ settings, lcdPort }) {
    if (!this.portObj) {
      if (settings.debug) {
        console.log('LCD init');
      }
      this.portObj = lcd.getPortObject(this.port);
      try {
        if (lcdPort.hasOwnProperty('brightness')) {
          await lcd.display({
            portObj: this.portObj,
            operation: 'brightness',
            input: lcdPort.brightness,
          });
        }
        if (lcdPort.hasOwnProperty('contrast')) {
          await lcd.display({
            portObj: this.portObj,
            operation: 'contrast',
            input: lcdPort.contrast,
          });
        }
        if (
          lcdPort.hasOwnProperty('color') &&
          lcdPort.color.hasOwnProperty('red') &&
          lcdPort.color.hasOwnProperty('green') &&
          lcdPort.color.hasOwnProperty('blue')
        ) {
          await lcd.display({
            portObj: this.portObj,
            operation: 'color',
            red: lcdPort.color.red,
            green: lcdPort.color.green,
            blue: lcdPort.color.blue,
          });
        }
        await lcd.display({ portObj: this.portObj, operation: 'clear' });
        await lcd.display({
          portObj: this.portObj,
          operation: 'text',
          row: 'line2',
          input: centerLine('Booting Universe,'),
        });
        await lcd.display({
          portObj: this.portObj,
          operation: 'text',
          row: 'line3',
          input: centerLine('please stand by...'),
        });
      } catch (e) {
        console.error('LCD Init error:');
        console.error(e);
      }
    }
  }

  /**
   * Update Adafruit LCD Display
   * @param {String} operation
   * @param {String} data
   * @param {Object} settings
   * @param {Object} gameState
   */
  async update({ operation, data, gameState, stationData }) {
    let lcdData;
    switch (operation) {
      case 'useStationText':
        lcdData = [{ text: stationData.lcdDisplayText }];
        break;
      case 'off':
        lcdData = { operation: 'displayOff' };
        break;
      case 'intro':
        lcdData = [
          {
            operation: 'text',
            row: 'line2',
            input: centerLine('Arm your station'),
          },
          {
            operation: 'text',
            row: 'line3',
            input: centerLine('to join!'),
          },
        ];
        break;
      case 'notStarted':
        break;
      case 'gameOver':
        lcdData = [
          { operation: 'text', row: 'line1', input: centerLine('GAME OVER') },
          {
            operation: 'text',
            row: 'line2',
            input: centerLine(`YOUR SCORE: ${data.score}`),
          },
          {
            operation: 'text',
            row: 'line3',
            input: centerLine('Please DISARM all'),
          },
          {
            operation: 'text',
            row: 'line4',
            input: centerLine('sides to try again'),
          },
        ];
        break;
      case 'maxTimeReached':
        lcdData = [
          {
            text: 'Time is up!',
          },
        ];
        break;
      case 'newInput':
        lcdData = [{ text: stationData.displayName }];
        break;
      case 'stationDone':
        lcdData = [
          {
            operation: 'text',
            row: 'line2',
            input: centerLine('SUCCESS!'),
          },
          {
            operation: 'text',
            row: 'line4',
            input: centerLine(`CURRENT SCORE: ${gameState.gameStats.score}`),
          },
        ];
        break;
      case 'crash':
        lcdData = [
          { text: `ERROR: Universe has crashed, please reboot it . . .` },
        ];
        break;
      default:
        lcdData = [
          { text: `ERROR: Universe has crashed, please reboot it . . .` },
        ];
        break;
    }
    // Remember not to spam the display! Check that the new data is NEW before updating!
    if (lcdData && !isEqual(lcdData, this.lcdData)) {
      this.lcdData = lcdData;
      while (!this.portObj) {
        // Wait for any existing operations to finish before running this one.
        // eslint-disable-next-line no-await-in-loop
        await wait(1);
      }
      await lcd.display({ portObj: this.portObj, operation: 'clear' });
      if (
        typeof lcdData === 'object' &&
        !Array.isArray(lcdData) &&
        lcdData.operation
      ) {
        console.log('displayLCD', lcdData.operation);
        // eslint-disable-next-line no-await-in-loop
        await lcd.display({
          portObj: this.portObj,
          operation: lcdData.operation,
        });
      } else if (lcdData.length === 1 && lcdData[0].hasOwnProperty('text')) {
        await formatAndSendToLCD({
          portObj: this.portObj,
          text: lcdData[0].text,
        });
      } else {
        for (const entry of lcdData) {
          // eslint-disable-next-line no-await-in-loop
          await lcd.display({
            portObj: this.portObj,
            operation: entry.operation,
            row: entry.row,
            input: entry.input,
          });
        }
      }
    }
  }
}

export default DisplayLCD;
