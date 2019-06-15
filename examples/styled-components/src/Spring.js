import { animated, useSpring } from 'react-spring';
import React, { useCallback, useState } from 'react';

export function SpringTest() {
  const [thingDone, toggleThingDone] = useState(false);
  const doTheThing = useCallback(() => toggleThingDone(!thingDone), [thingDone]);

  const fader = useSpring({ opacity: thingDone ? 1 : 0 });

  return (
    <React.Fragment>
      <animated.h1 style={fader}>You did the thing!</animated.h1>
      <button type="button" onClick={doTheThing}>
        {thingDone ? 'Undo The Thing' : 'Do The Thing'}
      </button>
    </React.Fragment>
  );
}
