import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readObjectFromFile from './readObjectFromFile.js';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
const configFile = `${__dirname}/../../settings.json5`;

async function loadSettings() {
  let configObject;
  try {
    configObject = await readObjectFromFile(configFile);
  } catch (error) {
    console.log(`Error reading ${configFile}:`);
    console.log(error);
    // File not existing will just return an empty object.
    // So an actual error is something worse, like the file being corrupted.
    process.exit(1);
  }

  return configObject;
}

export default loadSettings;
