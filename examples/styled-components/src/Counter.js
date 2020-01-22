import React, { useContext, useState, useEffect, useRef } from 'react';

const TimerContext = React.createContext(0);

const ComponentA = () => {
  const value = useContext(TimerContext);
  const [state] = useState('A');
  return (
    <div>
      {state}-{value}-
      <TimerContext.Consumer>{v => v}</TimerContext.Consumer>
    </div>
  );
};

const ComponentB = () => {
  const [state] = useState('B');
  const value = useContext(TimerContext);
  return (
    <div>
      {state}-{value}-
      <TimerContext.Consumer>{v => v}</TimerContext.Consumer>
    </div>
  );
};

const useSomeHandler = function() {
  return 43;
};

function RippleComponent() {
  function useRippleHandler() {}
  useRippleHandler();
  useRippleHandler();

  return false;
}

const Counter = ({ children }) => {
  const [count, setState] = useState(0);
  const useRippleHandler = function() {};
  useRippleHandler();
  useSomeHandler();
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
        <RippleComponent />
      </TimerContext.Provider>
    </div>
  );
};

export default Counter;
