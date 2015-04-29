/*
  This is taken from React's TestUtils,
  but slightly tweaked. When this works
  as I intend, I should probably submit a PR to React.

  https://github.com/facebook/react/issues/3760
*/

// Whatever
global.document = {};

var ReactCompositeComponent = require("react/lib/ReactCompositeComponent");
var ReactInstanceHandles = require("react/lib/ReactInstanceHandles");
var ReactInstanceMap = require("react/lib/ReactInstanceMap");
var ReactEmptyComponent = require("react/lib/ReactEmptyComponent");
var ReactUpdates = require("react/lib/ReactUpdates");
var shouldUpdateReactComponent = require("react/lib/shouldUpdateReactComponent");
var assign = require("react/lib/Object.assign");

/**
 * @class ReactShallowRenderer
 */
var ReactShallowRenderer = function() {
  this._instance = null;
};

ReactShallowRenderer.prototype.getRenderOutput = function() {
  return (
    (this._instance && this._instance._renderedComponent &&
     this._instance._renderedComponent._renderedOutput)
    || null
  );
};

var NoopInternalComponent = function(element) {
  this._renderedOutput = element;
  this._currentElement = element === null || element === false ?
    ReactEmptyComponent.emptyElement :
    element;
};

NoopInternalComponent.prototype = {

  mountComponent: function() {
  },

  receiveComponent: function(element) {
    this._renderedOutput = element;
    this._currentElement = element === null || element === false ?
      ReactEmptyComponent.emptyElement :
      element;
  },

  unmountComponent: function() {
  }

};

var ShallowComponentWrapper = function() { };
assign(
  ShallowComponentWrapper.prototype,
  ReactCompositeComponent.Mixin, {
    _instantiateReactComponent: function(element) {
      return new NoopInternalComponent(element);
    },
    _replaceNodeWithMarkupByID: function() {},
    _renderValidatedComponent:
      ReactCompositeComponent.Mixin.
        _renderValidatedComponentWithoutOwnerOrContext
  }
);

ReactShallowRenderer.prototype.render = function(element, context) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  this._render(element, transaction, context);
  ReactUpdates.ReactReconcileTransaction.release(transaction);
  return this._instance.getPublicInstance();
};

ReactShallowRenderer.prototype.unmount = function() {
  if (this._instance) {
    this._instance.unmountComponent();
    this._instance = null;
  }
};

ReactShallowRenderer.prototype._render = function(element, transaction, context) {
  var prevElement = this._element;
  if (this._instance && !shouldUpdateReactComponent(prevElement, element)) {
    this.unmount();
  }

  if (!this._instance) {
    var rootID = ReactInstanceHandles.createReactRootID();
    var instance = new ShallowComponentWrapper(element.type);
    instance.construct(element);

    instance.mountComponent(rootID, transaction, context);

    this._instance = instance;
  } else {
    this._instance.receiveComponent(element, transaction, context);
  }

  this._element = element;
};

module.exports = function createShallowRenderer() {
  return new ReactShallowRenderer()
};