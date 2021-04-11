module.exports = {
  env: {
    worker: true,
  },
  globals: {
    FS: 'readonly',
    NODEFS: 'readonly',
    Module: 'readonly',
  },
};
