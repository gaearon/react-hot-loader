# Contributing to `react-hot-loader`

As the creators and maintainers of this project, we want to ensure that
`react-hot-loader` lives and continues to grow and evolve. The evolution of the
library should never be blocked by any single person's time. One of the simplest
ways of doing this is by encouraging a larger set of shallow contributors.
Through this, we hope to mitigate the problems of a project that needs updates
but there's no-one who has the power to do so.

## Code contributions

Here is a quick guide to doing code contributions to the library.

1.  Find some issue you're interested in, or a feature that you'd like to tackle.
    Also make sure that no one else is already working on it. We don't want you
    to be disappointed.

2.  Fork, then clone: `git clone https://github.com/YOUR_USERNAME/react-hot-loader.git`

3.  Create a branch with a meaningful name for the issue: `git checkout -b fix-something`

4.  Make your changes and commit: `git add` and `git commit`

5.  Make sure that the tests still pass: `yarn test:es2015 --watch` and `yarn test:modern --watch`

6.  Push your branch: `git push -u origin your-branch-name`

7.  Submit a pull request to the upstream react-hot-loader repository.

8.  Choose a descriptive title and describe your changes briefly.

9.  Wait for a maintainer to review your PR, make changes if it's being
    recommended, and get it merged.

10. Perform a celebratory dance! :dancer:

### How do I set up the project?

1.  First make sure you have [yarn](https://yarnpkg.com/) installed.

2.  Run `yarn` and let `yarn dev` running in background, you are ready!

3.  You can also run `yarn test:watch` to run tests in watch mode.

### How do I check if it really works?

There is a lot of examples in the project, they are all under `examples/`
folder. Choose an example to test and follow these steps:

1.  Run `yarn`
2.  Run `yarn install file:../packages/react-hot-loader`
3.  Test it!

## Credits

Heavily inspired from
[styled-components contributing guidelines](https://github.com/styled-components/styled-components/blob/master/CONTRIBUTING.md).
