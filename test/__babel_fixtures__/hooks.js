import React, {useState} from 'react';
import {useExternalHook} from 'external-hook'

const NoHooks = () => <div>no hooks</div>;

const UseStateHook = () => {
  useState(42);
};

const UseStateHooks = () => {
  useState(42);
  useState(24);
};

const useEffectHook = () => {
  React.useEffect(() => ({}));
  useState(24);
  React.useState(42);
};

const useForwardRefHook = React.forwardRef(() => {
  React.useEffect(() => ({}));
  useState(24);
  React.useState(42);
});

const useForwardRefFunctionHook = React.forwardRef(function () {
  React.useEffect(() => ({}));
  useState(24);
  React.useState(42);
});

const useCustomHook = () => {
  useState(42);
  useEffectHook();
  useExternalHook();
};

const useCustomHookAgain = () => {
  useState(42);
  useEffectHook();
  useExternalHook();
};

const useInnerHook = ({useHookFromProps}) => {
  const useHookBase = () => useState();
  const useHook = () => useState(useHookFromProps(useHookBase()));
  useHookFromProps();
  {
    // sub scope
    useHook();
  }
};

function useFunc () {
  useState(42);
  useEffectHook();
};