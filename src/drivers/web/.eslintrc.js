/* eslint-env node*/
module.exports = {
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    'fp/no-class': 'error',
    'fp/no-this': 'error',
  },
  env: {
    browser: true,
    node: false,
  },
};
