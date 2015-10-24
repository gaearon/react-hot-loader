import supportsProtoAssignment from './supportsProtoAssignment';

// Display a developer friendly warning if __proto__ is not supported
if (supportsProtoAssignment({}) === false) {
  console.warn('This JavaScript environment does not support __proto__. ' +
               'This means that react-proxy is unable to proxy React Components. ' +
               'Features that rely on react-proxy, such as react-transform-hmr, ' +
               'will not function as expected.');
}

export default from './createClassProxy';
