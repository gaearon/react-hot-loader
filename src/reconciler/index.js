import getReactStack, {deepMapUpdate} from '../internal/getReactStack'
import hotReplacementRender, {
  flushScheduledUpdates,
  unscheduleUpdate
} from './hotReplacementRender'

const reconcileHotReplacement = ReactInstance => {
  const stack = getReactStack(ReactInstance);
  hotReplacementRender(ReactInstance, stack)
  deepMapUpdate(stack);
}

export { flushScheduledUpdates, unscheduleUpdate }

export default reconcileHotReplacement
