'use strict';

module.exports = {
  extends: [
    '@masteringjs'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  env: {
    node: true,
    es6: true
  },
  globals: {
    HAS_PASSWORD: true
  },
  ignorePatterns: ['pages/*', 'pages/api/*']
};
