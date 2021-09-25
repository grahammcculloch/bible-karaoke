export default function isDev(): boolean {
  // Importing npm 'electron-is-dev' causes an error running tests as we don't run in an electron environment.
  // Ava sets the NODE_ENV to 'test'.
  if (process.env.NODE_ENV === 'test') {
    return false;
  } else {
    // set ELECTRON_ENV before running dev, e.g. "cross-env ELECTRON_ENV=development electron ."
    return process.env.ELECTRON_ENV === 'development';
  }
}
