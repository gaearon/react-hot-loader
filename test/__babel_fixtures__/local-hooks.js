import {useState} from "react";

function Component1() {
  function useRippleHandler() {}
  useRippleHandler();
  useRippleHandler();
}

function Component2() {
  const useRippleHandler = () => {};
  useRippleHandler();
  useRippleHandler();
}

function Component3() {
  const useRippleHandler = function () {};
  useRippleHandler();
  useRippleHandler();
}

const useInnerHook = ({useHookFromProps}) => {
  const useHookBase = () => useState();
  const useHook = () => useState(useHookFromProps(useHookBase()));
  useHookFromProps();
  {
    // sub scope
    useHook();
  }
};

const OnlyThisOneUsesExternalHook = () => {
  useInnerHook();
  useState();
};

// check for "return ["