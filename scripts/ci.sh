set -e

echo "Building project"
yarn build
echo "\n\n"

echo "Linting"
yarn lint
echo "\n\n"

./scripts/react-16.ci.sh
./scripts/react-17.ci.sh