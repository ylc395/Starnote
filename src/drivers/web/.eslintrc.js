/* eslint-env node*/
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    'fp/no-class': 'error',
    'fp/no-this': 'error',
    'vue/no-unused-components': isProduction ? 'error' : 'warn',
    'vue/component-tags-order': [
      'error',
      { order: ['script', 'template', 'style'] },
    ],
    'vue/no-mutating-props': 'off',
    'vue/no-setup-props-destructure': 'off',
  },
  env: {
    browser: true,
    node: false,
  },
};
