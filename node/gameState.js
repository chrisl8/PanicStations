const gameState = {
  initCalled: false,
  atGameIntro: true,
  gameStarted: false,
  gameOver: false,
  boardInitiated: false,
  waitingForInput: false,
  nextInstructionForSide1: 1,
  nextInstructionForSide2: 1,
  totalStationCount: 2, // A typical TARDIS would have 5, or 4 if one station is used for, say a computer running Spotify.
  stationsArmed: 2, // TODO: Make this variable, either by menu, or setting up a way to start game play without arming all stations.
  stationsInPlay: [], // Hold station data
  instructionsForStations: [],
  requiredKnobPosition1: null,
  requiredKnobPosition2: null,
  displayNameForStation1: '',
  displayNameForStation2: '',
  score: 0,
  recentInputList: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ], // Make this longer or shorter to reject a longer list of recent inputs
  timeElapsed: 0,
  maxTime: 10,
  clockUpdate: 0, // Used to regulate update of the clock, so we don't spam it and slow down the game
  player1done: false,
  player2done: false,
  statistics: [],
};

export default gameState;
