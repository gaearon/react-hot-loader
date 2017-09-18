module.exports = {
  extends: '../.eslintrc.js',
  env: {
    jest: true,
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  rules: {
    'react/prefer-stateless-function': 'off',
    'react/no-multi-comp': 'off',
    'react/prefer-es6-class': 'off',
    'react/prop-types': 'off',
    'no-shadow': 'off',
    'new-cap': 'off',
    'import/first': 'off',
    'class-methods-use-this': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
  },
}
