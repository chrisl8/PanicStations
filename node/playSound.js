import { exec } from 'child_process';
import settings from './settings.js';

const playSound = (sound) => {
  exec(
    `amixer -q -M sset Headphone ${settings.volume.setting}%;aplay sounds/${sound}.wav`,
  );
};

export default playSound;
