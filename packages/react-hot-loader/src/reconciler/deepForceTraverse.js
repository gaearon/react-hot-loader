const isReactClass = (fn) => !!fn.render;
const isFunctional = (fn) => typeof fn === 'function';
const isArray = (fn) => Array.isArray(fn);
const asArray = a => isArray(a) ? a : [a];

const swappable = (a,b) => {

}


function callFunctionalComponent(component, props, context) {
  return component(props, context);
}

const render = (component, stack) => {
  if (isReactClass(component)) {
    return component.render();
  }
  if (isFunctional(component)) {
    return callFunctionalComponent(component, stack.props, stack.context);
  }
  if (isArray(component)) {
    return component.map(render)
  }
};

const deepForceTraverse = (instance, stack) => {
  const flow = asArray(render(instance, stack));
  const children = stack.children;
  flow.forEach( (child, index) => {
    const schild = children[index];
    // they are both registered, or have equal code/displayname/signature
    if(swappable(child.type,schild.type)){
      // update proxy
      swap(child,schild);
      // swap.. call deep
      deepForceTraverse(child.ins,schild);
    }
  });
}


export default deepForceTraverse;