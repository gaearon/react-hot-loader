import { animated, useSpring } from 'react-spring';
import React, { useCallback, useState } from 'react';
import Counter from './Counter';

const context = React.createContext('test1');

const Test = () => {
  const v = React.useContext(context);

  return (
    <div>
      --{v}-- ##<Counter />
    </div>
  );
};

export function SpringTest() {
  const [thingDone, toggleThingDone] = useState(false);
  const doTheThing = useCallback(() => toggleThingDone(!thingDone), [thingDone]);

  const fader = useSpring({ opacity: thingDone ? 1 : 0 });

  const v = React.useContext(context);

  return (
    <React.Fragment>
      {v}
      <context.Provider value={24}>
        <Test />
      </context.Provider>
      <context.Provider value="test2">
        <Test />
      </context.Provider>
      <animated.h1 style={fader}>You did the thing!</animated.h1>
      <button type="button" onClick={doTheThing}>
        {thingDone ? 'Undo The Thing' : 'Do The Thing'}
      </button>
    </React.Fragment>
  );
}
