function updateMaxTime(gameState) {
  let maxTime = gameState.maxTime;
  // MINIMUM TIME HERE:
  if (gameState.score > 10 && gameState.maxTime > 5) {
    maxTime--;
  } else if (gameState.score > 20 && gameState.maxTime > 4) {
    maxTime--;
  } else if (gameState.score > 30 && gameState.maxTime > 3) {
    maxTime--;
  } else if (gameState.score > 40 && gameState.maxTime > 2) {
    maxTime--;
  } else if (gameState.score > 50 && gameState.maxTime > 1) {
    maxTime--;
  }
  return maxTime;
}

export default updateMaxTime;
