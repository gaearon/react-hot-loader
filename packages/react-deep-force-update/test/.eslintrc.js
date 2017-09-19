module.exports = {
  extends: '../.eslintrc.js',
  env: { jest: true },
  rules: {
    'react/prefer-stateless-function': 'off',
    'react/no-multi-comp': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'react/prefer-es6-class': 'off',
  },
}
