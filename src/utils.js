export const maxBy = (array = [], getValue = obj => obj, maxFunc = Math.max) => {
  if (array && array.length) {
    return array.reduce((prev, current) => maxFunc(getValue(prev), getValue(current)), array[0]);
  }
  return undefined;
};

export default {
  maxBy,
};
