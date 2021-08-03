import { observable, computed, action } from 'mobx';
import os from 'os';
import path from 'path';
import { persist } from 'mobx-persist';
import { PROJECT_TYPE, DEFAULT_OUTPUT_DIRECTORY } from '../constants';
import Store from '.';

export const getDefaultHearThisDirectory = (): string => {
  switch (process.platform) {
    case 'win32':
      return 'C:\\ProgramData\\SIL\\HearThis\\';
    case 'darwin':
    default:
      return `${os.homedir()}/hearThisProjects/`;
  }
};

export const getDefaultScriptureAppBuilderDirectory = (): string => {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), 'Documents', 'App Builder', 'Scripture Apps', 'App Projects');
    case 'darwin':
    default:
      return `${os.homedir()}/App Builder/Scripture Apps/App Projects/`;
  }
};

class Settings {
  root: Store;

  constructor(root: Store) {
    this.root = root;
  }

  @persist('list')
  @observable
  hearThisRootDirectories: string[] = [getDefaultHearThisDirectory()];

  @persist('list')
  @observable
  scriptureAppBuilderRootDirectories: string[] = [getDefaultScriptureAppBuilderDirectory()];

  @persist
  @observable
  outputDirectory: string = DEFAULT_OUTPUT_DIRECTORY;

  @persist
  @observable
  enableAnalytics = false;

  @computed({ keepAlive: true })
  get rootDirectories(): { [x: string]: string[] } {
    return {
      [PROJECT_TYPE.hearThis]: this.hearThisRootDirectories.slice(),
      [PROJECT_TYPE.scriptureAppBuilder]: this.scriptureAppBuilderRootDirectories.slice(),
    };
  }

  @action.bound
  setHearThisRootDirectories(directories: string[]): void {
    this.hearThisRootDirectories = directories;
  }

  @action.bound
  setScriptureAppBuilderRootDirectories(directories: string[]): void {
    this.scriptureAppBuilderRootDirectories = directories;
  }

  @action.bound
  setOutputDirectory(outputDirectory: string): void {
    this.outputDirectory = outputDirectory;
  }

  @action.bound
  setEnableAnalytics(enableAnalytics: boolean): void {
    this.enableAnalytics = enableAnalytics;
  }
}

export default Settings;
