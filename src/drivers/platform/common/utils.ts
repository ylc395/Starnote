// @see https://ourcodeworld.com/articles/read/525/how-to-check-if-your-code-is-being-executed-in-electron-or-in-the-browser
export function isElectron() {
  // Renderer process
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    window.process.type === 'renderer'
  ) {
    return true;
  }

  // Main process
  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.electron
  ) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
}

export function isRenderer() {
  // running in a web browser
  if (typeof process === 'undefined') return true;

  // node-integration is disabled
  if (!process) return true;

  // We're in node.js somehow
  if (!process.type) return false;

  return process.type === 'renderer';
}
