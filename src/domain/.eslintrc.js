/* eslint-env node */
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: ['vue', '@vue/runtime-core'],
        patterns: ['*ant-design*'],
      },
    ],
  },
  globals: {
    setInterval: 'readonly',
    clearInterval: 'readonly',
    console: 'readonly',
  },
  env: {
    browser: false,
    node: false,
  },
};
