import { observable, computed, action, makeObservable } from 'mobx';
import { persist } from 'mobx-persist';
import { RootDirectories } from '../../models/store.model';
import { PROJECT_TYPE } from '../constants';
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
  setOverwriteFile(overwriteOutputFiles: boolean): void {
    this.overwriteOutputFiles = overwriteOutputFiles;
  }

  @action.bound
  setEnableAnalytics(enableAnalytics: boolean): void {
    this.enableAnalytics = enableAnalytics;
  }
}

export default Settings;
