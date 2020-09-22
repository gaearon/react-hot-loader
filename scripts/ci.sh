set -e

echo "Building project"
yarn build
echo "\n\n"

echo "Linting"
yarn lint
echo "\n\n"

#./react-15.ci.sh
./react-16.ci.sh
./react-17.ci.sh