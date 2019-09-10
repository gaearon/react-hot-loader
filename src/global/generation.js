import { forEachKnownClass } from '../proxy/createClassProxy';

// this counter tracks `register` invocations.
// works good, but code splitting is breaking it
let generation = 1;

// these counters are aimed to mitigate the "first render"
let hotComparisonCounter = 0;
let hotComparisonRuns = 0;
let hotReplacementGeneration = 0;

const nullFunction = () => ({});

// these callbacks would be called on component update
let onHotComparisonOpen = nullFunction;
let onHotComparisonElement = nullFunction;
let onHotComparisonClose = nullFunction;

// inversion of control
export const setComparisonHooks = (open, element, close) => {
  onHotComparisonOpen = open;
  onHotComparisonElement = element;
  onHotComparisonClose = close;
};

export const getElementComparisonHook = component => onHotComparisonElement(component);
export const getElementCloseHook = component => onHotComparisonClose(component);

export const hotComparisonOpen = () =>
  hotComparisonCounter > 0 && hotComparisonRuns > 0 && hotReplacementGeneration > 0;

const openGeneration = () => forEachKnownClass(onHotComparisonElement);

export const closeGeneration = () => forEachKnownClass(onHotComparisonClose);

const incrementHot = () => {
  if (!hotComparisonCounter) {
    openGeneration();
    onHotComparisonOpen();
  }
  hotComparisonCounter++;
};
const decrementHot = () => {
  hotComparisonCounter--;
  if (!hotComparisonCounter) {
    closeGeneration();
    hotComparisonRuns++;
  }
};

export const configureGeneration = (counter, runs) => {
  hotComparisonCounter = counter;
  hotComparisonRuns = runs;
  hotReplacementGeneration = runs;
};

// TODO: shall it be called from incrementHotGeneration?
export const enterHotUpdate = () => {
  Promise.resolve(incrementHot()).then(() => setTimeout(decrementHot, 0));
};

// TODO: deprecate?
export const increment = () => {
  enterHotUpdate();
  return generation++;
};
export const get = () => generation;

// These counters tracks HMR generations, and probably should be used instead of the old one
export const incrementHotGeneration = () => hotReplacementGeneration++;
export const getHotGeneration = () => hotReplacementGeneration;
