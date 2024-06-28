'use strict';

module.exports = {
  extends: ['@masteringjs'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    node: true,
    es6: true,
  },
  globals: {
    API_URL: true,
    HAS_PASSWORD: true,
  },
  ignorePatterns: ['pages/*', 'pages/api/*'],
  rules: {
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
  },
};
