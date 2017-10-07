# Tips and Tricks

**How to get an error in your console too:**

The previously used `Redbox` for React Hot Loader has known limitations due to sourcemaps and it's no longer a default catcher. Errors are great to clearly see rendering issues, and avoiding an uncaught error from breaking your app. But there are some advantages to a thrown error in the console too, like filename resolution via sourcemaps, and click-to-open. To get the `Redbox` back, and have the best of both worlds, modify your app entry point as follows:

```jsx
import Redbox from 'redbox-react';
import PropTypes from 'prop-types';

const CustomErrorReporter = ({ error }) => <Redbox error={ error } />;

CustomErrorReporter.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired
};

render((
  <HotContainer errorReporter={ CustomErrorReporter }>
    <AppRoot />
  </HotContainer>
), document.getElementById('react-root'));
```

You'll also need to `npm install --save-dev redbox-react`.
