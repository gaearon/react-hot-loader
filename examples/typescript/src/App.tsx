import {hot} from 'react-hot-loader/root';
import * as React from 'react'
import Counter from './Counter'

const App = () => (
    <div>
      <h1>Hello, world.</ h1>
      <Counter/>
    </div>
  )

;(async () => {
  console.log('You have async support if you read this instead of "ReferenceError: regeneratorRuntime is not defined" error.');
})()

export default hot(App)
