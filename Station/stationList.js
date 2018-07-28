const stationList = [];

stationList.push([
  {
    id: 1,
    pin: 7,
    type: 'switch',
    subType: 'arm',
    label: 'Arm',
    description: 'Big toggle switch with cover',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 2,
    pin: 54 + 12,
    type: 'button',
    subType: 'big',
    label: 'Big Blue Button',
    funName: 'Push Big Blue Button!',
    description: 'Large round button',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 3,
    pin: 'A4',
    type: 'knob',
    label: 'Blue Knob',
    description: 'Blue knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'Demand',
    up: 'Stress Blanket',
    left: 'Kitten',
    right: 'Sustenance',
  },
  {
    id: 4,
    pin: 'A5',
    type: 'knob',
    label: 'Red Knob',
    description: 'Red knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'Repair',
    up: 'Maintenance Drone',
    left: 'Hull',
    right: 'Paradox',
  },
  {
    id: 5,
    pin: 'A3',
    type: 'knob',
    label: 'White Knob',
    description: 'White knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'Compatibility',
    up: '2',
    left: '1',
    right: '3',
  },
  {
    id: 6,
    pin: 27,
    type: 'button',
    subType: 'small',
    label: 'Yellow Button Right',
    funName: 'Say Hazelnut',
    description: 'Yellow Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 7,
    pin: 28,
    type: 'button',
    subType: 'small',
    label: 'Green Button Right',
    funName: 'Stabilize Crew',
    description: 'Green Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 8,
    pin: 29,
    type: 'button',
    subType: 'small',
    label: 'Red Button Right',
    funName: 'Hack Microwave',
    description: 'Red Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 9,
    pin: 30,
    type: 'button',
    subType: 'small',
    label: 'Yellow Button Left',
    funName: 'Run For Your Life',
    description: 'Yellow Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 10,
    pin: 31,
    type: 'button',
    subType: 'small',
    label: 'White Button Right',
    funName: 'Give Up',
    description: 'White Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 11,
    pin: 22,
    type: 'button',
    subType: 'small',
    label: 'Blue Button Left',
    funName: 'Set Fire to the Sun',
    description: 'Blue Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 12,
    pin: 23,
    type: 'button',
    subType: 'small',
    label: 'Blue Button Right',
    funName: 'Punch Wood',
    description: 'Blue Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 13,
    pin: 24,
    type: 'button',
    subType: 'small',
    label: 'Green Button Left',
    funName: 'Do The Thing',
    description: 'Green Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 14,
    pin: 25,
    type: 'button',
    subType: 'small',
    label: 'White Button Left',
    funName: 'Summon Silicon',
    description: 'White Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 15,
    pin: 26,
    type: 'button',
    subType: 'small',
    label: 'Red Button Left',
    funName: 'Reverse Polarity',
    description: 'Red Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 16,
    pin: 32,
    type: 'switch',
    subType: 'small',
    label: 'Switch 2',
    funName: 'Over Analyzer',
    description: 'Switch 2',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 17,
    pin: 33,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Brick Order',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 18,
    pin: 34,
    type: 'switch',
    subType: 'small',
    label: 'Switch 4',
    funName: 'Thaumaturgy',
    description: 'Switch 4',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 19,
    pin: 35,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Cheats',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 20,
    pin: 36,
    type: 'switch',
    subType: 'small',
    label: 'Switch 5',
    funName: 'Super Special Mega Thingy',
    description: 'Switch 5',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 21,
    pin: 37,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Borangatang',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 22,
    pin: 38,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Existential Crisis',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 23,
    pin: 39,
    type: 'switch',
    subType: 'small',
    label: 'Switch 3',
    funName: 'The Dumb',
    description: 'Switch 3',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 24,
    pin: 40,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Probability',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 25,
    pin: 41,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Gyro locking',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 26,
    pin: 43,
    type: 'switch',
    subType: 'small',
    label: 'Switch 1',
    funName: 'Excuse Generator',
    description: 'Switch 1',
    currentStatus: null,
    hasBeenPressed: false,
  },
]);

stationList.push([
  {
    id: 1,
    pin: 6,
    type: 'switch',
    subType: 'arm',
    label: 'Arm',
    description: 'Big toggle switch with cover',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 2,
    pin: 54 + 13, // Analog as digital, add one past last pin number plus Analog pin number
    type: 'button',
    subType: 'big',
    label: 'Big Green Button',
    funName: 'Push Big Green Button!',
    description: 'Large round button',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 3,
    pin: 'A2',
    type: 'knob',
    label: 'White Knob',
    description: 'White knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'Chores',
    up: 'Protesting',
    left: 'Laundry',
    right: 'Trash',
  },
  {
    id: 4,
    pin: 'A1',
    type: 'knob',
    label: 'Red Knob',
    description: 'Red knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'Reactor Level',
    up: '2',
    left: '1',
    right: '3',
  },
  {
    id: 5,
    pin: 'A0',
    type: 'knob',
    label: 'Blue Knob',
    description: 'Blue knob',
    currentStatus: null,
    hasBeenPressed: false,
    currentSetting: null,
    previousSetting: null,
    funName: 'System Language',
    up: 'Wingdings',
    left: 'Kilog',
    right: 'TechB',
  },
  {
    id: 6,
    pin: 2,
    type: 'button',
    subType: 'small',
    label: 'Green Button Right',
    funName: 'Preheat Towels',
    description: 'Green Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 7,
    pin: 3,
    type: 'button',
    subType: 'small',
    label: 'White Button Left',
    funName: 'Go Home',
    description: 'White Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 8,
    pin: 4,
    type: 'button',
    subType: 'small',
    label: 'Blue Button Left',
    funName: 'Punch Hole in Universe',
    description: 'Blue Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 9,
    pin: 5,
    type: 'button',
    subType: 'small',
    label: 'Yellow Button Left',
    funName: 'Pulse Microthruster',
    description: 'Yellow Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 10,
    pin: 8,
    type: 'button',
    subType: 'small',
    label: 'Yellow Button Right',
    funName: 'Flip the Switch',
    description: 'Yellow Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 11,
    pin: 9,
    type: 'button',
    subType: 'small',
    label: 'Red Button Left',
    funName: 'Crash Thermostat',
    description: 'Red Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 12,
    pin: 10,
    type: 'button',
    subType: 'small',
    label: 'Green Button Left',
    funName: 'Distribute Stress Balls',
    description: 'Green Button Left',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 13,
    pin: 11,
    type: 'button',
    subType: 'small',
    label: 'Red Button Right',
    funName: 'Confuse Polarity',
    description: 'Red Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 14,
    pin: 12,
    type: 'button',
    subType: 'small',
    label: 'Blue Button Right',
    funName: 'Rage Quit',
    description: 'Blue Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 15,
    pin: 13,
    type: 'button',
    subType: 'small',
    label: 'White Button Right',
    funName: 'Find Magrathea',
    description: 'White Button Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 16,
    pin: 48,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Bulkheads',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 17,
    pin: 47,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Overdrive',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 18,
    pin: 46,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Judging Machine',
    description: 'Middle Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 19,
    pin: 45,
    type: 'switch',
    subType: 'small',
    label: 'Switch 4',
    funName: 'Improbability',
    description: 'Second Switch from the Right',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 20,
    pin: 44,
    type: 'switch',
    subType: 'small',
    label: 'White Button Right',
    funName: 'Cry For Help',
    description: 'Far Right Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 21,
    pin: 49,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Llama',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 22,
    pin: 50,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: "Someone Else's Problem Field",
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 23,
    pin: 51,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Killer Robots',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 24,
    pin: 52,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Neurotic Elevators',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 25,
    pin: 53,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Sanity',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
  {
    id: 26,
    pin: 42,
    type: 'switch',
    subType: 'small',
    label: 'Switch',
    funName: 'Focus Group Tester',
    description: 'Switch',
    currentStatus: null,
    hasBeenPressed: false,
  },
]);

module.exports = stationList;
