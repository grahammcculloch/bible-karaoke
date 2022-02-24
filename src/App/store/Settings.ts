import { observable, computed, action, makeObservable } from 'mobx';
import { persist } from 'mobx-persist';
import { RootDirectories } from '../../models/store.model';
import { SOURCE_TYPES } from '../constants';
import Store from '.';

class Settings {
  root: Store;

  constructor(root: Store) {
    makeObservable(this);
    this.root = root;
  }

  @persist('list')
  @observable
  hearThisRootDirectories: string[] = [window.api.getDefaultHearThisDirectory()];

  @persist('list')
  @observable
  scriptureAppBuilderRootDirectories: string[] = [window.api.getDefaultScriptureAppBuilderDirectory()];

  @persist
  @observable
  outputDirectory: string = window.api.getDefaultOutputDirectory();

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
