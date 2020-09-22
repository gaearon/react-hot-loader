echo "Installing React 17"
yarn add react@17.0.0-rc.2 react-dom@17.0.0-rc.2 react-test-renderer@17.0.0-rc.2 --pure-lockfile
echo "\n\n"

yarn test:react-dom:prepare

echo "Running tests on React 17 - Babel ES2015"
yarn test:es2015
echo "\n\n"

echo "Running tests on React 17 - Babel Modern"
yarn test:modern --coverage && codecov
echo "\n\n"
