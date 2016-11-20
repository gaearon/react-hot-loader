# Tips and Tricks

**How to get an error in your console too:**

The `Redbox` errors are great to clearly see rendering issues, and avoiding an uncaught error from breaking your app.  But there are some advantages to a thrown error in the console too, like filename resolution via sourcemaps, and click-to-open.  To get the best of both worlds, modify your app entry point as follows:

```jsx
import Redbox from 'redbox-react';

const consoleErrorReporter = ({error}) => {
  console.error(error);
  return <Redbox error={error} />;
};

consoleErrorReporter.propTypes = {
  error: React.PropTypes.instanceOf(Error).isRequired
};

render((
  <AppContainer errorReporter={consoleErrorReporter}>
    <AppRoot />
  </AppContainer>
), document.getElementById('react-root'));
```

You'll also need to `npm install --save-dev redbox-react`.
