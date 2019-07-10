import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';

import { MyComponent } from './MyComponent';
import { HookComponent } from './HookComponent';

const App = () => {
  const [state] = useState(42);
  const [effect, setEffect] = useState(42);

  useEffect(() => {
    setEffect(effect + 1);
  }, []);

  useEffect(
    () => {
      setEffect(effect + 0.1);
    },
    ['hot'],
  );

  return (
    <div>
      <MyComponent>
        test {state} : {effect}
      </MyComponent>
      <HookComponent />
    </div>
  );
};

export default hot(App);
