import getReactStack from '../internal/getReactStack'
import hotReplacementRender, {
  flushScheduledUpdates,
  unscheduleUpdate
} from './hotReplacementRender'

const reconcileHotReplacement = ReactInstance =>
  hotReplacementRender(ReactInstance, getReactStack(ReactInstance))

export { flushScheduledUpdates, unscheduleUpdate }

export default reconcileHotReplacement
