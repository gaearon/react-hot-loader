const injectionStart = {
  '16.13': [
    'isCompatibleFamilyForHotReloading(child, element)',
    'hotCompareElements(child.elementType, element.type, hotUpdateChild(child), child.type)'
  ],
  '16.10': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type || ( // Keep this check inline so it only runs on the false path:\n        isCompatibleFamilyForHotReloading(child, element)))',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.elementType, element.type, hotUpdateChild(child), child.type))'
  ],
  '16.9': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type || (\n        // Keep this check inline so it only runs on the false path:\n        isCompatibleFamilyForHotReloading(child, element)))',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.elementType, element.type, hotUpdateChild(child), child.type))'
  ],
  '16.6': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type)',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.elementType, element.type, hotUpdateChild(child), child.type))',
  ],
  '16.6-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.elementType===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.elementType,element.type, hotUpdateChild(child), child.type))',
  ],
  '16.4': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.type === element.type) {',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.type, element.type, hotUpdateChild(child), child.type)) {',
  ],
  '16.4-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.type===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.type,element.type, hotUpdateChild(child), child.type))',
  ],
};

const additional = {
  '16.13-update': [
    'isCompatibleFamilyForHotReloading(current, element)',
    'hotCompareElements(current.elementType, element.type, hotUpdateChild(current), current.type)'
  ],
  '16.10-update': [
    'current$$1.elementType === element.type || ( // Keep this check inline so it only runs on the false path:\n    isCompatibleFamilyForHotReloading(current$$1, element)))',
    '(hotCompareElements(current$$1.elementType, element.type, hotUpdateChild(current$$1), current$$1.type)))'
  ],
  '16.9-update': [
    'current$$1.elementType === element.type || (\n    // Keep this check inline so it only runs on the false path:\n    isCompatibleFamilyForHotReloading(current$$1, element)))',
    '(hotCompareElements(current$$1.elementType, element.type, hotUpdateChild(current$$1), current$$1.type)))'
  ],
  '16.6-update': [
    'if (current$$1 !== null && current$$1.elementType === element.type) {',
    'if (current$$1 !== null && hotCompareElements(current$$1.elementType, element.type, hotUpdateChild(current$$1),current$$1.type)) {',
  ],
  '16.6-update-compact': [
    'if(current$$1!==null&&current$$1.elementType===element.type)',
    'if(current$$1!==null&&hotCompareElements(current$$1.elementType,element.type,hotUpdateChild(current$$1),current$$1.type))',
  ],
  '16.4-update': [
    'if (current !== null && current.type === element.type) {',
    'if (current !== null && hotCompareElements(current.type, element.type, hotUpdateChild(current),current.type)) {',
  ],
  '16.4-update-compact': [
    'if (current!== null&&current.type===element.type)',
    'if (current!== null&&hotCompareElements(current.type,element.type,hotUpdateChild(current)))',
  ],

  '17.0.0-rc1': [
    'function createFiberFromTypeAndProps(type, // React$ElementType\n' +
    'key, pendingProps, owner, mode, lanes) {',
    'function createFiberFromTypeAndProps(type, // React$ElementType\n' +
    'key, pendingProps, owner, mode, lanes) {type = hotResolveType(type);',
  ],

  '17.0.0-rc1-compact': [
    'function createFiberFromTypeAndProps(type,// React$ElementType\n' +
    'key,pendingProps,owner,mode,lanes){',
    'function createFiberFromTypeAndProps(type,// React$ElementType\n' +
    'key,pendingProps,owner,mode,lanes){type = hotResolveType(type);',
  ],

  '16.8-type': [
    'function createFiberFromTypeAndProps(type, // React$ElementType\nkey, pendingProps, owner, mode, expirationTime) {',
    'function createFiberFromTypeAndProps(type, // React$ElementType\nkey, pendingProps, owner, mode, expirationTime) {type = hotResolveType(type);',
  ],

  '16.8-type-compact': [
    'function createFiberFromTypeAndProps(type,// React$ElementType\nkey,pendingProps,owner,mode,expirationTime){',
    'function createFiberFromTypeAndProps(type,// React$ElementType\nkey,pendingProps,owner,mode,expirationTime){type = hotResolveType(type);',
  ]
};


const reactHotLoaderCode = `
var hotUpdateChild = function (child) {
  return function (newType) {
    child.type = newType;
    if (child.alternate) {
      child.alternate.type = newType;
    }
  }
};
var hotResolveType = function (type) {
  return type;
};
var hotCompareElements = function (oldType, newType) {
  return oldType === newType
};
var hotCleanupHooks = function () {
  if (typeof resetHooks !== 'undefined') {
    resetHooks();
  }
}

var evalInReactContext = function (injection) {
  return eval(injection);
};
var hotCleanup = hotCleanupHooks;
var hotRenderWithHooks = function (current, render) {
  hotCleanupHooks();

  if (typeof nextCurrentHook !== 'undefined' && typeof ReactCurrentDispatcher$1 !== 'undefined') {
    nextCurrentHook = current !== null ? current.memoizedState : null;
    if (typeof firstCurrentHook !== 'undefined') {
      firstCurrentHook = nextCurrentHook;
    }

    ReactCurrentDispatcher$1.current = nextCurrentHook === null ? HooksDispatcherOnMountInDEV : HooksDispatcherOnUpdateInDEV;
  }

  var rendered = render();

  hotCleanupHooks();

  return rendered;
}
var setHotElementComparator = function (newComparator) {
  hotCompareElements = newComparator
};
var setHotTypeResolver = function (newResolver) {
  hotResolveType = newResolver;
};
`;

const CJS = `
${reactHotLoaderCode};

var ReactDOM = {
  evalInReactContext: evalInReactContext,
  hotCleanup: hotCleanup,
  hotRenderWithHooks: hotRenderWithHooks,
  setHotElementComparator: setHotElementComparator,
  setHotTypeResolver: setHotTypeResolver,
`;

const commonJSEnd = ['var ReactDOM = {', CJS];
const commonJSEndCompact = ['var ReactDOM={', CJS];

const ESM = `
${reactHotLoaderCode};

exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Internals;

exports.evalInReactContext= evalInReactContext,
exports.hotCleanup= hotCleanup,
exports.hotRenderWithHooks= hotRenderWithHooks,
exports.setHotElementComparator= setHotElementComparator,
exports.setHotTypeResolver= setHotTypeResolver,
`;

const esmEnd = ['exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Internals;', ESM];

const injectionEnd = {
  '16.13': esmEnd,
  '16.10': commonJSEnd,
  '16.9': commonJSEnd,
  '16.6': commonJSEnd,
  '16.4': commonJSEnd,
  '16.6-compact': commonJSEndCompact,
  '16.4-compact': commonJSEndCompact,
};

const sign = '/* 🔥 this is hot-loader/react-dom 🔥 */';

function additionalTransform(source) {
  for (const key in additional) {
    source = source.split(additional[key][0]).join(additional[key][1]);
  }
  return source;
}

function transform(source) {
  if (source.indexOf('reconcileSingleElement') < 0) {
    // early reject
    return source;
  }
  if (source.indexOf(sign) >= 0) {
    // already patched
    return source;
  }
  for (const key in injectionStart) {
    if (source.indexOf(injectionStart[key][0]) > 0 && source.indexOf(injectionEnd[key][0]) > 0) {
      const result = additionalTransform(
        source
          .replace(injectionStart[key][0], injectionStart[key][1])
          .replace(injectionEnd[key][0], injectionEnd[key][1]),
      );
      return `${sign}\n${result}\n${sign}`;
    }
  }
  return source;
}

module.exports = transform;
