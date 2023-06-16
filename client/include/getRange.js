// eslint-disable-next-line consistent-return
function getRange(int) {
  const ranges = {
    down: { less: 10, greater: 950 },
    left: { less: 950, greater: 600 },
    up: { less: 600, greater: 300 },
    right: { less: 300, greater: 10 },
  };
  for (const vector in ranges) {
    if (Object.prototype.hasOwnProperty.call(ranges, vector)) {
      if (int < ranges[vector].less && int > ranges[vector].greater) {
        // we found the right one
        return vector;
      }
      if (ranges[vector].less < ranges[vector].greater) {
        if (int < ranges[vector].less || int > ranges[vector].greater) {
          return vector;
        }
      }
    }
  }
}

export default getRange;
