module.exports = {
  purge: { content: ['./public/**/*.html', './src/**/*.vue'] },
  darkMode: false,
  theme: {
    extend: {
      colors: {
        inherit: 'inherit',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disabled this, since this will influence AntdV style
  },
};
