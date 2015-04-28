export default function makeAssimilatePrototype() {
  const sourceOfTruth = {};

  return function assimilatePrototype(freshPrototype) {
    // That's naïve but we'll only move forward with tests now
    sourceOfTruth.__proto__ = freshPrototype;
    return sourceOfTruth;
  };
};