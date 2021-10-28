import { create } from 'mobx-persist';
import { MobXProviderContext } from 'mobx-react';
import React from 'react';
import AppState from './AppState';
import Settings from './Settings';

export { Book, Chapter, Project } from './AppState';

export function useStores(): Store {
  return React.useContext(MobXProviderContext) as Store;
}

const hydrate = create();

class Store {
  appState: AppState;
  settings: Settings;
  constructor() {
    this.appState = new AppState(this);
    this.settings = new Settings(this);
  }

  async init(): Promise<void> {
    await hydrate('bk-appState', this.appState);
    await hydrate('bk-settings', this.settings);
    this.appState.migrateFromLocalStorage();
  }
}

export default Store;
