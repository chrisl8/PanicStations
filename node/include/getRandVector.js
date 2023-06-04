function getRandVector() {
  const possibleVectors = ['up', 'left', 'right'];
  const rand = Math.floor(Math.random() * possibleVectors.length);
  return possibleVectors[rand];
}

export default getRandVector;
