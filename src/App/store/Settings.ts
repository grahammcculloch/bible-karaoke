// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { observable, computed, action, makeObservable } from 'mobx';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { persist } from 'mobx-persist';
import type { RootDirectories } from '../../models/store.model';
import { SOURCE_TYPES } from '../constants';
import Store from '.';

class Settings {
  root: Store;

  constructor(root: Store) {
    makeObservable(this);
    this.root = root;
    this.init();
  }

  private async init(): Promise<void> {
    this.setOutputDirectory(await window.api.getDefaultOutputDirectory());
    this.setHearThisRootDirectories([await window.api.getDefaultHearThisDirectory()]);
    this.setScriptureAppBuilderRootDirectories([await window.api.getDefaultScriptureAppBuilderDirectory()]);
  }

  @persist('list')
  @observable
  hearThisRootDirectories: string[] = [];

  @persist('list')
  @observable
  scriptureAppBuilderRootDirectories: string[] = [];

  @persist
  @observable
  outputDirectory = '';

  @persist
  @observable
  overwriteOutputFiles = false;

  @persist
  @observable
  enableAnalytics = false;

  @computed({ keepAlive: true })
  get rootDirectories(): RootDirectories {
    return {
      [SOURCE_TYPES.hearThis]: this.hearThisRootDirectories.slice(),
      [SOURCE_TYPES.scriptureAppBuilder]: this.scriptureAppBuilderRootDirectories.slice(),
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
  setOverwriteFile(overwriteOutputFiles: boolean): void {
    this.overwriteOutputFiles = overwriteOutputFiles;
  }

  @action.bound
  setEnableAnalytics(enableAnalytics: boolean): void {
    this.enableAnalytics = enableAnalytics;
  }
}

export default Settings;
