import stationList from './stationList.js';
import settings from './settings.js';

// TODO: I'm not entirely sure if this will work or not.
import screenBoxes from './screenBoxes.js';

let blessed;
let screen;

function initialize() {
  if (!screen) {
    // eslint-disable-next-line global-require
    blessed = require('blessed');
    screen = blessed.screen({
      smartCSR: true,
    });

    screen.title = 'Push the Button!';

    // Append our box to the screen.
    screen.append(screenBoxes.topBox);
    screen.append(screenBoxes.introductionBox);

    screenBoxes.introductionBox.setContent(
      '{center}Booting Universe, please stand by . . .',
    );

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    // Render the screen.
    screen.render();
  }
}

function update({ state, data }) {
  // TODO: Remember, if the logic gets too crazy here, then keep the logic
  // TODO: in the primaryGameLoop and add more individual state options here.
  switch (state) {
    case 'intro':
      screen.append(screenBoxes.introductionBox);
      screenBoxes.introductionBox.setContent(
        'In the Twenty-Fourth and a Halfth Century humanity has expanded across the galaxy. There are many special people with heroic tasks to accomplish. There are also a lot of mundane tasks that we thought robots would be doing by now, but the the robots have better things to do . . . or perhaps you are a robot, that is also a possibility.\n' +
          'You have one job: push the button . . . buttons . . . and turn the knobs and flip the switches.\n\n' +
          'Arm both stations to begin!',
      );
      if (stationList[0][0].currentStatus !== 'on') {
        screenBoxes.waitingToArm1box.setContent(
          '{center}Waiting for Station 1 to Arm.{/center}',
        );
        screen.append(screenBoxes.waitingToArm1box);
      } else {
        screen.remove(screenBoxes.waitingToArm1box);
      }
      if (stationList[1][0].currentStatus !== 'on') {
        screenBoxes.waitingToArm2box.setContent(
          '{center}Waiting for Station 2 to Arm.{/center}',
        );
        screen.append(screenBoxes.waitingToArm2box);
      } else {
        screen.remove(screenBoxes.waitingToArm2box);
      }
      break;
    case 'notStarted':
      screen.remove(screenBoxes.introductionBox);
      screen.append(screenBoxes.commandBox);
      screenBoxes.commandBox.setContent('{center}Get ready!{/center}');
      break;
    case 'gameOver':
      if (stationList[0][0].currentStatus !== 'off') {
        screenBoxes.waitingToArm1box.setContent(
          '{center}Waiting for Station 1 to DISARM.{/center}',
        );
        screen.append(screenBoxes.waitingToArm1box);
      } else {
        screen.remove(screenBoxes.waitingToArm1box);
      }
      if (stationList[1][0].currentStatus !== 'off') {
        screenBoxes.waitingToArm2box.setContent(
          '{center}Waiting for Station 2 to DISARM.{/center}',
        );
        screen.append(screenBoxes.waitingToArm2box);
      } else {
        screen.remove(screenBoxes.waitingToArm2box);
      }
      if (
        stationList[0][0].currentStatus === 'off' &&
        stationList[1][0].currentStatus === 'off'
      ) {
        screen.remove(screenBoxes.commandBox);
      } else {
        screenBoxes.commandBox.setContent(`GAME OVER!\n
            \n\nYOUR SCORE: ${data.score}
            \n\nYou had ONE BUTTON (or switch . . . or knob . . .) to push, but you failed . . .
            \n\nPlease DISARM both Stations to try again.
            `);
      }
      break;
    case 'maxTimeReached':
      screen.remove(screenBoxes.leftBottomBox);
      screen.remove(screenBoxes.rightBottomBox);
      break;
    case 'player1done':
    case 'player2done':
    case 'waitingForInput':
      screen.append(screenBoxes.leftBottomBox);
      screenBoxes.leftBottomBox.setContent(
        `Time Left: ${
          data.maxTime * (1000 / settings.loopTime) - data.timeElapsed
        }`,
      );
      screen.append(screenBoxes.rightBottomBox);
      screenBoxes.rightBottomBox.setContent(`SCORE: ${data.score}`);
      break;
    case 'generatingNextCommand':
      screenBoxes.commandBox.setContent(`\n${data.displayNameForStation1}\n
            \n
            and
            \n
            \n${data.displayNameForStation2}`);
      break;
    case 'crash':
      screenBoxes.commandBox.setContent(
        `ERROR: Universe has crashed, please reboot it . . .`,
      );
      break;
    default:
      screen.render();
      break;
  }
  screen.render();
}

export default {
  initialize,
  update,
};
