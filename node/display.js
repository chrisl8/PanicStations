const settings = require('./settings');
const screen = require('./displayScreen');
const DisplayLCD = require('./displayLCD');

let lcd1;
let lcd2;

function initialize() {
  if (settings.useScreen) {
    screen.initialize();
  }
  if (settings.useLCD) {
    lcd1 = new DisplayLCD(settings.stationOneLcdPort.name);
    lcd2 = new DisplayLCD(settings.stationTwoLcdPort.name);
    lcd1.initialize();
    lcd2.initialize();
  }
}

function update(input) {
  if (settings.useLCD) {
    lcd1.update({ state: input.state, data: input.data, station: 1 });
    lcd2.update({ state: input.state, data: input.data, station: 2 });
  }
  if (settings.useScreen) {
    screen.update(input);
  }
}

module.exports = {
  initialize,
  update,
};
