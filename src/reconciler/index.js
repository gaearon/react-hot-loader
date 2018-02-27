import getReactStack from '../internal/getReactStack'
import hotReplacementRender, {
  flushScheduledUpdates
} from './hotReplacementRender'

const reconcileHotReplacement = ReactInstance =>
  hotReplacementRender(ReactInstance, getReactStack(ReactInstance))

export { flushScheduledUpdates }

export default reconcileHotReplacement
