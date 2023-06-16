import blessed from 'blessed';

function initialize({ settings }) {
  const mainBoxTop = 10;
  const mainBoxHeight = 25;
  const stationBoxesTop = mainBoxTop + mainBoxHeight;
  const boxes = {
    titleBox: blessed.box({
      top: '0',
      left: '0',
      width: '100%',
      height: '10%',
      align: 'center',
      valign: 'middle',
      content: `{center}{bold}${settings.gameTitle}{/bold}{/center}`,
      tags: true,
      // border: {
      //     type: 'line'
      // },
      style: {
        fg: 'white',
        bg: 'blue',
        // border: {
        //     fg: '#f0f0f0'
        // },
        // hover: {
        //     bg: 'green'
        // }
      },
    }),

    mainBox: blessed.text({
      top: '10%',
      left: '0',
      width: '100%',
      height: '25%',
      content: 'Hello {bold}world{/bold}!',
      tags: true,
      border: {
        type: 'line',
      },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0',
        },
        hover: {
          bg: 'green',
        },
      },
    }),
    leftBottomBox: blessed.box({
      top: '85%',
      left: '0',
      width: '50%',
      height: '10%',
      align: 'center',
      valign: 'middle',
      content: 'Hello {bold}world{/bold}!',
      tags: true,
      // border: {
      //     type: 'line'
      // },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0',
        },
        hover: {
          bg: 'green',
        },
      },
    }),

    rightBottomBox: blessed.box({
      top: '85%',
      left: '50%',
      width: '50%',
      height: '10%',
      align: 'center',
      valign: 'middle',
      content: 'Hello {bold}world{/bold}!',
      tags: true,
      // border: {
      //     type: 'line'
      // },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0',
        },
        hover: {
          bg: 'green',
        },
      },
    }),
    stationBoxes: {},
  };

  let stationBoxCount = 0;
  for (const [key] of Object.entries(settings.stations)) {
    stationBoxCount++;
    boxes.stationBoxes[key] = blessed.box({
      // TODO: Increase nextStationBoxTop based on station count also.
      top: `${stationBoxesTop}%`,
      left: stationBoxCount % 2 === 0 ? '50%' : '0',
      width: '50%',
      height: '10%',
      align: 'center',
      valign: 'middle',
      content: `Station ${key}`,
      tags: true,
      // border: {
      //     type: 'line'
      // },
      style: {
        fg: 'white',
        bg: 'magenta',
        border: {
          fg: '#f0f0f0',
        },
        hover: {
          bg: 'green',
        },
      },
    });
  }

  return boxes;
}

export default { initialize };
