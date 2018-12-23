export const maxBy = (
  array = [],
  getValue = obj => obj,
  maxFunc = Math.max
) => {
  if (array && array.length) {
    return array.reduce(
      (prev, current) => maxFunc(getValue(prev), getValue(current)),
      array[0]
    );
  }
  return undefined;
};

/**
 * Returns a line of text connecting leftText and rightText by dots in between without exceeding the max width
 * @param {String} leftText
 * @param {String} rightText
 * @param {Number} maxWidth max width in pixels
 * @param {Number} minDots minimum number of dots between the two texts
 * @param {String} seperator text to seprate between the two texts
 * @param {Function} getTextWidth a function that returns the width of a given text in pixels
 */
export const connectWithDotsToFitLine = (
  leftText,
  rightText,
  maxWidth,
  minDots,
  seperator,
  getTextWidth
) => {
  console.log(leftText, rightText, maxWidth, minDots, seperator, getTextWidth);
};

export default {
  maxBy
};
