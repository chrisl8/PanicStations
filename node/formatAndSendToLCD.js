import formatGridText from './formatGridText.js';
import lcd from './LCD20x4.js';

async function formatAndSendToLCD({ text, portObj }) {
  const formattedText = formatGridText({ text, columns: 20, rows: 4 });
  for (let i = 0; i < formattedText.length; i++) {
    if (formattedText[i] !== '') {
      // eslint-disable-next-line no-await-in-loop
      await lcd.display({
        portObj,
        operation: 'text',
        row: `line${i + 1}`,
        input: formattedText[i],
      });
    }
  }
}

export default formatAndSendToLCD;
