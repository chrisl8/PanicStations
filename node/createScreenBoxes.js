import blessed from 'blessed';

function initialize() {
  return {
    topBox: blessed.box({
      top: '0',
      left: '0',
      width: '100%',
      height: '10%',
      align: 'center',
      valign: 'middle',
      content: '{center}{bold}Push The Button{/bold}{/center}',
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

    introductionBox: blessed.text({
      top: '10%',
      left: '0',
      width: '100%',
      height: '75%',
      // content: 'Hello {bold}world{/bold}!',
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

    commandBox: blessed.box({
      top: '10%',
      left: '0',
      width: '100%',
      height: '75%',
      // content: 'Hello {bold}world{/bold}!',
      tags: true,
      align: 'center',
      valign: 'center',
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

    waitingToArm1box: blessed.box({
      top: '85%',
      left: '0',
      width: '50%',
      height: '15%',
      // content: 'Hello {bold}world{/bold}!',
      tags: true,
      valign: 'center',
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

    waitingToArm2box: blessed.box({
      top: '85%',
      left: '50%',
      width: '50%',
      height: '15%',
      // content: 'Hello {bold}world{/bold}!',
      tags: true,
      valign: 'center',
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

    leftBottomBox: blessed.box({
      top: '85%',
      left: '0',
      width: '50%',
      height: '15%',
      // content: 'Hello {bold}world{/bold}!',
      tags: true,
      valign: 'center',
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
      height: '15%',
      // content: 'Hello {bold}world{/bold}!',
      tags: true,
      valign: 'center',
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

    leftBox: blessed.text({
      top: '10%',
      left: '0',
      width: '50%',
      height: '90%',
      // content: 'Hello {bold}world{/bold}!',
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

    rightBox: blessed.text({
      top: '10%',
      left: '50%',
      width: '50%',
      height: '90%',
      // content: 'Hello {bold}world{/bold}!',
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
  };
}

export default { initialize };
