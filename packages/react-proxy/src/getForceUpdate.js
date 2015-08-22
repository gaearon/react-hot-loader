/**
 * Returns a function that force-updates an instance
 * regardless of whether it descends from React.Component or not.
 */
export default function getForceUpdate(React) {
  return instance => {
    React.Component.prototype.forceUpdate.call(instance);
  };
}
