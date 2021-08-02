import React from 'react';
import { create } from 'mobx-persist';
import { MobXProviderContext } from 'mobx-react';
import AppState from './AppState';
import Settings from './Settings';

const hydrate = create();

export function useStores(): Record<string, any> {
  return React.useContext(MobXProviderContext);
}

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
