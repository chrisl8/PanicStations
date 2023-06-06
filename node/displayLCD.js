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

  async initialize({ settings }) {
    if (!this.portObj) {
      if (settings.debug) {
        console.log('LCD init');
      }
      this.portObj = lcd.getPortObject(this.port);
      try {
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

  async update({ state, data, gameState, stationData }) {
    let lcdData;
    switch (state) {
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
            input: centerLine(`CURRENT SCORE: ${gameState.score}`),
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
      if (lcdData.length === 1 && lcdData[0].hasOwnProperty('text')) {
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
