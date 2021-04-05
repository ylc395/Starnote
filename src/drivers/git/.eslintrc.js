module.exports = {
  env: {
    worker: true,
  },
  globals: {
    EmscriptenModule: 'readonly',
    FS: 'readonly',
    MEMFS: 'readonly',
    Module: 'readonly',
  },
};
