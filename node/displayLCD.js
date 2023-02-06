import lcd from './LCD20x4.js';
import wait from './wait.js';
import formatAndSendToLCD from './formatAndSendToLCD.js';
import gameState from './gameState.js';

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
  }

  async initialize() {
    if (!this.portObj) {
      console.log('LCD init');
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

  async update({ state, data, station }) {
    // TODO: Remember not to spam the display! Check that the new data is NEW before updating.
    if (this.savedState !== state) {
      while (!this.portObj) {
        // Wait for any existing operations to finish before running this one.
        // eslint-disable-next-line no-await-in-loop
        await wait(1);
      }
      this.savedState = state;
      console.log(state);
      switch (state) {
        case 'intro':
          await lcd.display({ portObj: this.portObj, operation: 'clear' });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line2',
            input: centerLine('Arm your station'),
          });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line3',
            input: centerLine('to begin!'),
          });
          break;
        case 'notStarted':
          break;
        case 'gameOver':
          await lcd.display({ portObj: this.portObj, operation: 'clear' });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line1',
            input: centerLine('GAME OVER'),
          });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line2',
            input: centerLine(`YOUR SCORE: ${data.score}`),
          });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line3',
            input: centerLine('Please DISARM both'),
          });
          await lcd.display({
            portObj: this.portObj,
            operation: 'text',
            row: 'line4',
            input: centerLine('sides to try again'),
          });
          // }
          break;
        case 'player1done':
          if (station === 1) {
            await lcd.display({ portObj: this.portObj, operation: 'clear' });
            await lcd.display({
              portObj: this.portObj,
              operation: 'text',
              row: 'line2',
              input: centerLine('SUCCESS!'),
            });
            await lcd.display({
              portObj: this.portObj,
              operation: 'text',
              row: 'line4',
              input: centerLine(`CURRENT SCORE: ${gameState.score}`),
            });
          }
          break;
        case 'player2done':
          if (station === 2) {
            await lcd.display({ portObj: this.portObj, operation: 'clear' });
            await lcd.display({
              portObj: this.portObj,
              operation: 'text',
              row: 'line2',
              input: centerLine('SUCCESS!'),
            });
            await lcd.display({
              portObj: this.portObj,
              operation: 'text',
              row: 'line4',
              input: centerLine(`CURRENT SCORE: ${gameState.score}`),
            });
          }
          break;
        case 'maxTimeReached':
          await lcd.display({ portObj: this.portObj, operation: 'clear' });
          break;
        case 'waitingForInput':
          break;
        case 'generatingNextCommand':
          if (station === 1 && !gameState.player1done) {
            await lcd.display({ portObj: this.portObj, operation: 'clear' });
            await formatAndSendToLCD({
              portObj: this.portObj,
              text: gameState.displayNameForStation1,
            });
          }
          if (station === 2 && !gameState.player2done) {
            await lcd.display({ portObj: this.portObj, operation: 'clear' });
            await formatAndSendToLCD({
              portObj: this.portObj,
              text: gameState.displayNameForStation2,
            });
          }
          break;
        case 'crash':
          await lcd.display({ portObj: this.portObj, operation: 'clear' });
          await formatAndSendToLCD({
            portObj: this.portObj,
            text: `ERROR: Universe has crashed, please reboot it . . .`,
          });
          break;
        default:
          await lcd.display({ portObj: this.portObj, operation: 'clear' });
          await formatAndSendToLCD({
            portObj: this.portObj,
            text: `ERROR: Universe has crashed, please reboot it . . .`,
          });
          break;
      }
    }
  }
}

export default DisplayLCD;
