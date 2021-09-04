# Bible Karaoke

Create 'karaoke-style' videos of Bible passages to help users become comfortable at reading the Bible in their own language.

## Users

Head on over to [biblek.info](http://biblek.info) to download and get started.

## Developers

Clone this repo:

```sh
git clone git@github.com:sillsdev/bible-karaoke.git bible-karaoke
cd bible-karaoke
```

Install the dependencies:

```sh
npm install
```

### Running AVA Unit and Integration Tests

We use the [AVA Node.js test runner](https://github.com/avajs/ava). When testing a single code unit use a unit test. When testing more than one unit of code or if the test takes time to execute then use an integration test. By default, the commands below will NOT execute tests in watch mode. If changing branches you may have to clear out `*.spec.js` and `*.integration.js` files.

For unit tests run:

```sh
npm test
```

For integration tests run:

```sh
npm run integration
```

### Writing AVA Unit and Integration Tests

Unit tests are placed in a `<unit>.spec.ts` file alongside the `<unit>.ts` file under test. Integration tests are placed in a `*.integration.ts` file. Our project looks for compiled test files ending in `\*.spec.js` or `\*.integration.js` depending on what type of test is being run.
If a test is more complex with sample data and/or scenarios, a test folder can optionally be created with additional supporting files to keep things tidy.

### Debugging AVA Test Files in VS Code

1. Open the test file in VS Code.
2. On the side bar select the **Run and Debug** view.
3. Select the configuration named _Debug Ava test file_ and click **Start Debugging** (F5).

Learn more about [VS Code debugging](https://code.visualstudio.com/docs/editor/debugging).

### Debugging/Running the application

```sh
npm run electron-dev
```

### Debugging the Node Backend in VS Code

We provide a debugging configuration for VS Code (defined in `.vscode/launch.json`)

1. set a breakpoint in VS Code somewhere in the Node backend JS code (not front-end React code)
2. `npm run electron-dev` (the Node debugger listens on port 9229)
3. In VS Code, run the Debug Configuration named _Node Backend_. The VS Code status bar will turn orange when it is successfully attached to the debugger
4. Use the Bible Karaoke application - the application will pause when a breakpoint is hit in VS Code

### Debugging the React Frontend in VS Code

TODO

### Build and package the app manually for testing

```sh
# Windows:
npm run electron-pack-win
# Mac:
npm run electron-pack-mac
# Linux:
npm run electron-pack-linux
```

Build the app automatically for distribution:

- Push to a branch of the form `release/*`, e.g. `release/v0.3.5`, or `release/v0.3.5-rc1`.
- Look in the GitHub **Actions** tab for the build artifacts.

Releasing

1. Update the _version_ in your project's `package.json` file (e.g. _0.3.4_).
2. Run `npm i` to update `package-lock.json`.
3. Update `CHANGELOG.md` with changes in this release.
4. Commit these changes to your release branch as defined in the section above.
5. Tag your commit. Make sure your tag name's format is `v*.*.*`.
6. Create a new draft GitHub **Release**, ensure the following are included:
   - a _Tag version_, e.g. `v0.3.4`.
   - a copy of the change log.
   - the installer artifact from GitHub **Actions** tab as Assets (attached binary) will be added in step 7.
7. Push the tag then the commit to GitHub.

### Style Guides

We use [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) with a pre-commit hook. If you use **VS Code**, install the recommended extensions from this repo and formatting will happen on save.

## Test Data

Developers can download test data (permission must be granted by an admin) from Google Drive

```
https://drive.google.com/drive/u/1/folders/1rTCkMPA3ZoOn6dXhJHuYTn6QdAKfBj0X
```

For Windows,

SAB projects are assumed to be located in this folder:

```
Documents\App Builder\Scripture Apps\App Projects\
```

HearThis projects are assumed to be located in this folder:

```
C:\ProgramData\SIL\HearThis\
```
