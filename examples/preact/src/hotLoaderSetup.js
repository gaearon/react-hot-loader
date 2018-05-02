import reactHotLoader, { compareOrSwap } from 'react-hot-loader'
import preact, { setComponentComparator } from 'preact'

reactHotLoader.inject(preact, 'h')

setComponentComparator(compareOrSwap)
//(oldC, newC) => compareOrSwap(oldC, Object.getPrototypeOf(newC)));

// changes to preact

/*


var defaultComp = (a,b) => a===b;

var componentComparator = defaultComp;

var compareComponents = (oldComponent,newComponent) => componentComparator(oldC,newC);

var setComponentComparator = comp => {componentComparator = comp || defaultComp};


//

return hydrating || compareComponents(node._componentConstructor, vnode.nodeName);

//

isDirectOwner = c && compareComponents(dom._componentConstructor, vnode.nodeName),




 */
