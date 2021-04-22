export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
export const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;
export const IS_IN_ELECTRON = process.env.IS_ELECTRON;
export const IS_IN_ELECTRON_RENDERER = IS_IN_ELECTRON && isRenderer();

export function isRenderer() {
  // running in a web browser
  if (typeof process === 'undefined') return true;

  // node-integration is disabled
  if (!process) return true;

  // We're in node.js somehow
  if (!process.type) return false;

  return process.type === 'renderer';
}
