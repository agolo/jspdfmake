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

String.prototype.reverse = function() {
  return this.split('')
    .reverse()
    .join('');
};

const EPS = 1e-5;

const lessThanOrEqual = (a, b) => {
  return a < b || Math.abs(a - b) < EPS;
};

const removeCharactersToFitWidth = (
  text,
  width,
  numOfDots,
  getTextWidth,
  seperator = ' '
) => {
  const paddingText = Array(numOfDots)
    .fill('.')
    .join('')
    .concat(seperator);
  const totalWidth = width - getTextWidth(paddingText);
  let nText = '';
  let i = 0;
  while (
    i < text.length &&
    lessThanOrEqual(
      getTextWidth(nText.concat(text[i], paddingText)),
      totalWidth
    )
  ) {
    nText = nText.concat(text[i]);
    i += 1;
  }
  nText = nText.concat(paddingText);
  return nText;
};

const addDotsToFitWidth = (text, width, getTextWidth, seperator = '  ') => {
  let nText = text;
  while (lessThanOrEqual(getTextWidth(nText.concat('.', seperator)), width)) {
    nText = nText.concat('.');
  }
  return nText.concat(seperator);
};

/**
 * Returns 2 lines connnected with dots, the first line is the link and the second is the page number
 * @param {Object} line the line to add dots to
 * @param {Number} minDots minimum number of dots between the two texts
 * @param {String} seperator text to seprate between the two texts
 * @param {Function} getTextWidth a function that returns the width of a given text in pixels
 */
export const connectWithDotsToFitLine = (line, getTextWidth) => {
  const minRightText = Array(9)
    .fill('.')
    .join('')
    .concat(line.linkPage);
  const rightTextWidth = getTextWidth(minRightText);
  const leftTextWidth = getTextWidth(line.text);
  let leftText = line.text;
  let rightText = minRightText;
  if (line.lineWidth - leftTextWidth < rightTextWidth) {
    // this means we need to remove some characters from the line text to make space for the dots and the pageNumber
    leftText = removeCharactersToFitWidth(
      line.text,
      line.lineWidth - rightTextWidth,
      2,
      getTextWidth
    );
  } else {
    rightText = addDotsToFitWidth(
      minRightText.reverse(),
      line.lineWidth - leftTextWidth,
      getTextWidth
    ).reverse();
  }
  return [
    { ...line, text: leftText },
    {
      ...line,
      text: rightText,
      xOffset: line.xOffset + line.lineWidth - getTextWidth(rightText)
    }
  ];
};

export default {
  maxBy
};
