import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import prettier from 'prettier';
import readObjectFromFile from './readObjectFromFile.js';

const writeObject = (path, objectLiteral) =>
  new Promise((resolve, reject) => {
    const formatted = prettier.format(JSON.stringify(objectLiteral), {
      parser: 'json5',
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
    });
    fs.writeFile(path, formatted, (err, fsData) => {
      if (err) {
        reject(err);
      } else {
        resolve(fsData);
      }
    });
  });

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
const configFile = `${__dirname}/../../settings.json5`;

async function loadSettings() {
  let settings;
  try {
    settings = await readObjectFromFile(configFile);
  } catch (error) {
    console.log(`Error reading ${configFile}:`);
    console.log(error);
    // File not existing will just return an empty object.
    // So an actual error is something worse, like the file being corrupted.
    process.exit(1);
  }

  if (!settings.hasOwnProperty('stations')) {
    console.error('Your settings.json5 file MUST include a stations object.');
    process.exit(1);
  }

  let settingsUpdated;

  // Validate and update settings with missing fields if any
  if (!settings.hasOwnProperty('uuid')) {
    settingsUpdated = true;
    settings.uuid = crypto.randomUUID();
  }

  for (const [, value] of Object.entries(settings.stations)) {
    if (!value.hasOwnProperty('uuid')) {
      settingsUpdated = true;
      value.uuid = crypto.randomUUID();
    }
  }

  if (settingsUpdated) {
    await writeObject(configFile, settings);
  }

  return settings;
}

export default loadSettings;
