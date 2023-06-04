import { exec } from 'child_process';

/**
 * @param {String} sound
 * @param {Object} settings
 */
const playSound = ({ sound, settings }) => {
  const playSoundExecCommand = `amixer -q -M sset ${settings.volume.alsaMixerDeviceName} ${settings.volume.setting}%;aplay sounds/${sound}.wav`;
  exec(playSoundExecCommand);
};

export default playSound;
