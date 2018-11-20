const injectionStart = {
  '16.6': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.elementType === element.type)',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.elementType, element.type, updateChild(child)))'
  ],
  '16.6-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.elementType===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.elementType,element.type, updateChild(child)))'
  ],
  '16.4': [
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.type === element.type) {',
    'if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : hotCompareElements(child.type, element.type, updateChild(child))) {'
  ],
  '16.4-compact': [
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:child.type===element.type)',
    'if(child.tag===Fragment?element.type===REACT_FRAGMENT_TYPE:hotCompareElements(child.type,element.type, updateChild(child)))'
  ],
};

const additional = {
  '16.6-update': [
    'if (current$$1 !== null && current$$1.elementType === element.type) {',
    'if (current$$1 !== null && hotCompareElements(current$$1.elementType, element.type, updateChild(current$$1))) {'
  ],
  '16.6-update-compact': [
    'if(current$$1!==null&&current$$1.elementType===element.type)',
    'if(current$$1!==null&&hotCompareElements(current$$1.elementType,element.type,updateChild(current$$1)))'
  ],
  '16.4-update': [
    'if (current !== null && current.type === element.type) {',
    'if (current !== null && hotCompareElements(current.type, element.type, updateChild(current))) {'
  ],
  '16.4-update-compact': [
    'if (current!== null&&current.type===element.type)',
    'if (current!== null&&hotCompareElements(current.type,element.type,updateChild(current)))'
  ]
};

const defaultEnd = [
  'var ReactDOM = {',
  `var updateChild = function (child) { return function (newType) {
       child.type = newType; 
       if (child.alternate) {
        child.alternate.type = newType;
       }
    }};
    var hotCompareElements = function (oldType, newType) { return oldType === newType };
    var ReactDOM = {
      setHotElementComparator: function (newComparator) { hotCompareElements = newComparator }, 
  `
];

const defaultEndCompact = [
  'var ReactDOM={',
  `var updateChild = function (child) { return function (newType) {
       child.type = newType; 
       if (child.alternate) {
        child.alternate.type = newType;
       }
    }};
    var hotCompareElements = function (oldType, newType) { return oldType === newType };
    var ReactDOM = {
      setHotElementComparator: function (newComparator) { hotCompareElements = newComparator }, 
  `
];


const injectionEnd = {
  '16.6': defaultEnd,
  '16.4': defaultEnd,
  '16.6-compact': defaultEndCompact,
  '16.4-compact': defaultEndCompact,
};

function additionalTransform(source) {
  for (const key in additional) {
    source = source.split(additional[key][0]).join(additional[key][1])
  }
  return source;
}

function transform(source) {
  if (source.indexOf('reconcileSingleElement') < 0) {
    // early reject
    return source;
  }
  for (const key in injectionStart) {
    if (
      source.indexOf(injectionStart[key][0]) > 0 &&
      source.indexOf(injectionEnd[key][0]) > 0
    ) {
      return additionalTransform(
        source
          .replace(injectionStart[key][0], injectionStart[key][1])
          .replace(injectionEnd[key][0], injectionEnd[key][1])
      ) + '/** react is now 🔥 */'
    }
  }
  return source;
}

module.exports = transform;
