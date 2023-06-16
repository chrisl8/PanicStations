import loadSettings from '../include/loadSettings.js';

async function getsettings() {
  const output = await loadSettings();
  if (!output) {
    console.error(
      `You MUST create a settings.json5 in the parent folder of index.js.`,
    );
    console.error(`You can find examples in the exampleSettings/ folder.`);
    process.exit(1);
  }
  return output;
}

export default getsettings;
