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
};
