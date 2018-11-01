import React from 'react'
import { hot, foo } from 'react-hot-loader'
import { hot as namedHot, foo as namedFoo } from 'react-hot-loader'
import { hot as namedHot2 } from 'react-hot-loader'
import * as RHL from 'react-hot-loader'
import * as RHL2 from 'react-hot-loader'

const App = () => <div>Hello World!</div>

const a = hot(module)(App);
const b = namedHot(module)(App);
const c = namedHot2(module)(App);
const d = RHL.hot(module)(App);
const e = RHL2.hot(module)(App);

foo(module)(App);
namedFoo(module)(App);
RHL.foo(module)(App);

export { a, b, c, d, e };
