import { contextBridge, ipcRenderer } from 'electron';
import { ProgressState } from '../main/models/progressState.model';
import { BKProject } from '../main/models/projectFormat.model';
import { OpenDialogOptions, SaveDialogOptions } from '../src/App/components/file-dialog.model';
import { RootDirectories } from '../src/models/store.model';
import { SubmissionArgs, SubmissionReturn } from '../src/models/submission.model';

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The functions below can accessed using `window.api.fnName`
   */

  getBKProject: (rootDirectories: RootDirectories): void => {
    ipcRenderer.send('did-start-getbkproject', rootDirectories);
  },

  onBKProject: (callback: (project: BKProject[]) => void): void => {
    ipcRenderer.on('did-finish-getbkproject', (_event: Event, projects: BKProject[]) => {
      callback(projects);
    });
  },

  saveFile: (options: SaveDialogOptions): void => {
    ipcRenderer.send('did-start-file-save-dialog', options);
  },

  onFileSave: (callback: (saveFilePath: string) => void): void => {
    ipcRenderer.on('did-finish-file-save-dialog', (_event: Event, saveFilePath: string) => {
      callback(saveFilePath);
    });
  },

  openFile: (options: OpenDialogOptions): void => {
    ipcRenderer.send('did-start-file-open-dialog', options);
  },

  onFileOpen: (callback: (openFilePath: string) => void): void => {
    ipcRenderer.on('did-finish-file-open-dialog', (_event: Event, openFilePaths: string) => {
      callback(openFilePaths);
    });
  },

  getFonts: (): void => {
    ipcRenderer.send('did-start-getfonts');
  },

  onGetFonts: (callback: (newFonts: string[] | Error) => void): void => {
    ipcRenderer.on('did-finish-getfonts', (_event: Event, newFonts: string[] | Error) => {
      callback(newFonts);
    });
  },

  startConversion: (settings: SubmissionArgs): void => {
    ipcRenderer.send('did-start-conversion', settings);
  },

  onProgress: (callback: (progress: ProgressState) => void): void => {
    ipcRenderer.on('on-progress', (_event: Event, progress: ProgressState) => {
      callback(progress);
    });
  },

  onConversionFinish: (callback: (result: SubmissionReturn) => void): void => {
    ipcRenderer.on('did-finish-conversion', (_event: Event, result: SubmissionReturn) => {
      callback(result);
    });
  },
};

contextBridge.exposeInMainWorld('api', api);
