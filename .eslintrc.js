module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    es2021: true,
    browser: true, // to use document, setTimeout, window and other browser things
    node: true, // to use http, require and other node things
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
  },
  plugins: ['prettier'],
};
