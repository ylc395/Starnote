/* eslint-env node */
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          'vue',
          '@vue/runtime-core',
          {
            name: '@vue/reactivity',
            importNames: ['reactive'],
            message: 'use ref',
          },
        ],
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
