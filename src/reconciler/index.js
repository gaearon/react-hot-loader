import getReactStack, { deepMarkUpdate, cleanupReact } from '../internal/getReactStack';
import hotReplacementRender, { flushScheduledUpdates, unscheduleUpdate } from './hotReplacementRender';

const reconcileHotReplacement = ReactInstance => {
  const stack = getReactStack(ReactInstance);
  hotReplacementRender(ReactInstance, stack);
  cleanupReact();
  deepMarkUpdate(stack);
};

export { flushScheduledUpdates, unscheduleUpdate };

export default reconcileHotReplacement;
