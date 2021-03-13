import { isElectron, isRenderer } from './utils';

export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
export const WEBPACK_DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL;
export const IS_IN_ELECTRON = isElectron();
export const IS_IN_ELECTRON_RENDERER = IS_IN_ELECTRON && isRenderer();
