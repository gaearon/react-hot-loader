import React, { useContext, useState, useEffect, useRef } from 'react';

const TimerContext = React.createContext(0);

const ComponentA = () => {
  const value = useContext(TimerContext);
  const [state] = useState('A');
  return (
    <div>
      {state}-{value}
    </div>
  );
};

const ComponentB = () => {
  const [state] = useState('B');
  const value = useContext(TimerContext);
  return (
    <div>
      {state}-{value}
    </div>
  );
};

const Counter = ({ children }) => {
  const [count, setState] = useState(0);
  useState(0);
  const ref = useRef();
  useEffect(() => {
    ref.current = 0;
    const int = setInterval(() => setState(ref.current++), 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div>
      <TimerContext.Provider value={count}>
        #{count}
        {children &&
          React.cloneElement(children, {
            counter: count,
          })}
        {count % 2 ? <ComponentA /> : <ComponentB />}
      </TimerContext.Provider>
    </div>
  );
};

export default Counter;
