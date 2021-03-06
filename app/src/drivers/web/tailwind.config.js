/* eslint-env node */
module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  important: '#app-body',
  theme: {
    extend: {
      colors: {
        inherit: 'inherit',
      },
      zIndex: {
        100: '100',
      },
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disabled this, since this will influence AntdV style
  },
};
