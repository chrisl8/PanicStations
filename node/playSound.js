const { exec } = require('child_process');
const settings = require('./settings');

const playSound = (sound) => {
  exec(
    `amixer -q -M sset Headphone ${settings.volume.setting}%;aplay sounds/${sound}.wav`,
  );
};

module.exports = playSound;
