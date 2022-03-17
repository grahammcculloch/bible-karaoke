import fs from 'fs';
import os from 'os';
import path from 'path';
import { contextBridge, ipcRenderer } from 'electron';
import _ from 'lodash';
import { OpenDialogOptions, SaveDialogOptions } from '../src/App/components/file-dialog.model';
import { IMAGE_BG_EXTS, VIDEO_BG_EXTS } from '../src/App/constants';
import { RootDirectories } from '../src/models/store.model';
import { SubmissionArgs, SubmissionReturn } from '../src/models/submission.model';
import { ProgressState } from './models/progressState.model';
import { BKProject } from './models/projectFormat.model';

export type API = typeof api;
export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The functions below can be accessed using `window.api.<fnName>`
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
    ipcRenderer.once('did-finish-file-save-dialog', (_event: Event, saveFilePath: string) => {
      callback(saveFilePath);
    });
  },

  openFile: (options: OpenDialogOptions): void => {
    ipcRenderer.send('did-start-file-open-dialog', options);
  },

  onFileOpen: (callback: (openFilePath: string) => void): void => {
    ipcRenderer.once('did-finish-file-open-dialog', (_event: Event, openFilePaths: string) => {
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

  getImageSrc: _.memoize((file: string): string => {
    if (!file) {
      return '';
    }
    try {
      const ext: string = file.split('.').pop() || '';
      if (IMAGE_BG_EXTS.includes(ext.toLowerCase())) {
        const img = fs.readFileSync(file);
        const img64 = Buffer.from(img).toString('base64');
        return `url(data:image/${ext};base64,${img64})`;
      }
    } catch (err) {
      console.error(`Failed to load image from '${file}'`);
    }
    return '';
  }),

  getViewBlob: (file: string): string => {
    if (!file) {
      return '';
    }
    // eslint-disable-next-line no-undef
    const URL = window.URL || window.webkitURL;
    let video = null;
    try {
      const ext: string = file.split('.').pop() || '';
      if (VIDEO_BG_EXTS.includes(ext.toLowerCase())) {
        video = fs.readFileSync(file);
        // eslint-disable-next-line no-undef
        const fileURL = URL.createObjectURL(new Blob([video], { type: 'video/mp4' }));
        return fileURL;
      }
    } catch (err) {
      console.error(`Failed to load video from '${file}'`);
    }
    return '';
  },

  getDefaultOutputDirectory: (): string => {
    const BK_DIR_NAME = 'Bible Karaoke Videos';
    switch (process.platform) {
      case 'win32': {
        const version = os.release();
        // if windows 7
        if (/^6\.1/.test(version)) {
          return path.join(os.homedir(), 'My Videos', BK_DIR_NAME);
        } else {
          return path.join(os.homedir(), 'Videos', BK_DIR_NAME);
        }
      }
      case 'darwin':
        return path.join(os.homedir(), BK_DIR_NAME);
      case 'linux':
      default:
        return path.join(os.homedir(), 'Videos', BK_DIR_NAME);
    }
  },

  getDefaultHearThisDirectory: (): string => {
    switch (process.platform) {
      case 'win32':
        return 'C:\\ProgramData\\SIL\\HearThis\\';
      case 'darwin':
      default:
        return `${os.homedir()}/hearThisProjects/`;
    }
  },

  getDefaultScriptureAppBuilderDirectory: (): string => {
    switch (process.platform) {
      case 'win32':
        return path.join(os.homedir(), 'Documents', 'App Builder', 'Scripture Apps', 'App Projects');
      case 'darwin':
      default:
        return `${os.homedir()}/Documents/AppBuilder/Scripture Apps/App Projects/`;
    }
  },
};

contextBridge.exposeInMainWorld('api', api);
