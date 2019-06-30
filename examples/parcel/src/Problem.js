import React from 'react';
import { useExternalHook } from './Counter';

export function Problem() {
  useExternalHook();
  return <div>the problem!!!!</div>;
}
