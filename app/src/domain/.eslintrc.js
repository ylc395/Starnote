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
  env: {
    'shared-node-browser': true,
  },
};
