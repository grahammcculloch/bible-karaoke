# Bible Karaoke

Create 'karaoke-style' videos of Bible passages to help users become comfortable at reading the Bible in their own language.

## Users

Head on over to [biblek.info](http://biblek.info) to download and get started.

## Developers

Notice: This repo utilizes the [Git Large File Storage (LFS) extension](https://git-lfs.github.com/).  Before cloning, install and setup git lfs.

Clone this repo:
```sh
git clone git@github.com:sillsdev/bible-karaoke.git bible-karaoke
cd bible-karaoke
```

Install the dependencies:
```sh
npm install
```

Debug the application:
```sh
npm run electron-dev
```

Build the app manually for testing:
```sh
# Windows:
npm run electron-pack-win
# Mac:
npm run electron-pack-mac
# Linux:
npm run electron-pack-linux
```

Build the app automatically for distribution:
* Push to a branch of the form `release/*`, e.g. `release/v0.3.4`, or `release/v0.3.4-rc1`.
* Look in the GitHub **Actions** tab for the build artifacts.

Releasing
1. Update the *version* in your project's `package.json` file (e.g. *0.3.4*).
2. Run `npm i` to update `package-lock.json`.
3. Update `CHANGELOG.md` with changes in this release.
4. Commit these changes to your release branch as defined in the section above.
5. Tag your commit. Make sure your tag name's format is `v*.*.*`. Push to GitHub.
6. Create a new draft GitHub **Release**, ensure the following are included:
    * a *Tag version*, e.g. `v0.3.4`.
    * the installer artifact from GitHub **Actions** tab as Assets (attached binary)
    * a copy of the change log

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
