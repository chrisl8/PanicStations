import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// https://stackoverflow.com/a/64383997/4982408
// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

const isWindows = process.platform === 'win32';

/**
 * @param {String} sound
 * @param {Object} settings
 */
const playSound = ({ sound, settings }) => {
  if (!settings.mute) {
    const soundFilePath = `${__dirname}/sounds/${sound}.wav`;
    let playSoundCommand;
    if (isWindows) {
      playSoundCommand = `(New-Object Media.SoundPlayer "${soundFilePath}").PlaySync();`;
      exec(playSoundCommand, { shell: 'powershell.exe' });
    } else {
      playSoundCommand = '';
      /*
      Obtain the alsaMixerDeviceName with:
      amixer -c 0 scontrols
      i.e., In this case it should be 'PCM'
      ❯ amixer -c 0 scontrols
      Simple mixer control 'PCM',0
       */
      if (
        settings.hasOwnProperty('volume') &&
        settings.volume.hasOwnProperty('alsaMixerDeviceName')
      ) {
        playSoundCommand = `amixer -q -M sset ${settings.volume.alsaMixerDeviceName} ${settings.volume.setting}%;`;
      }
      playSoundCommand = `${playSoundCommand}aplay "${soundFilePath}"`;
      exec(playSoundCommand);
    }
  }
};

export default playSound;
