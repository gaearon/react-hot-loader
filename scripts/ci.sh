set -e

echo "Building project"
yarn build
echo "\n\n"

echo "Linting"
yarn lint
echo "\n\n"

echo "Installing React 15"
yarn add react@15 react-dom@15 react-test-renderer@15 --pure-lockfile
echo "\n\n"

echo "Running tests on React 15 - Babel ES2015"
yarn test:es2015
echo "\n\n"

echo "Running tests on React 15 - Babel Modern"
yarn test:modern
echo "\n\n"
echo "\n\n"

echo "Installing React 16"
yarn add react@16.4 react-dom@16.4 react-test-renderer@16 --pure-lockfile
echo "\n\n"

echo "Running tests on React 16 - Babel ES2015"
yarn test:es2015
echo "\n\n"

echo "Running tests on React 16 - Babel Modern"
yarn test:modern --coverage && codecov
echo "\n\n"
