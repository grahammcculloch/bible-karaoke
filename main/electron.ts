import fs from 'fs';
import path from 'path';
import {
  app,
  ipcMain,
  shell,
  Menu,
  BrowserWindow,
  Event,
  IpcMainEvent,
  SaveDialogOptions,
  dialog,
  OpenDialogOptions,
} from 'electron';
import fontList from 'font-list';
import { map, flatten } from 'lodash';
import winston from 'winston';
import { RootDirectories } from '../src/models/store.model';
import { SubmissionArgs, SubmissionReturn } from '../src/models/submission.model';
import isDev from '../src/utility/isDev';
import { convert } from './commands/convert';
import { prepareLogger } from './commands/logger';
import { ProgressState } from './models/progressState.model';
import { BKProject } from './models/projectFormat.model';
import SourceIndex from './sources/index';

let mainWindow: BrowserWindow | undefined;

export function createWindow(): void {
  prepareLogger();
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 970,
    show: false,
    backgroundColor: '#30404d',
    webPreferences: {
      nodeIntegration: false,
      webSecurity: true,
      enableRemoteModule: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadURL(isDev() ? 'http://localhost:3000' : `file://${path.join(__dirname, '../index.html')}`);
  if (isDev()) {
    mainWindow.webContents.openDevTools();
  } else {
    Menu.setApplicationMenu(null);
  }

  mainWindow.maximize();

  mainWindow.on('closed', (): void => {
    mainWindow = undefined;
  });
  mainWindow.webContents.on('new-window', (event: Event, url: string): void => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
}

function handleFileDialogs(): void {
  ipcMain.on('did-start-file-save-dialog', async (event: IpcMainEvent, options: SaveDialogOptions): Promise<void> => {
    if (mainWindow != null) {
      winston.log('info', 'File save dialog');
      const filePath = (await dialog.showSaveDialog(mainWindow, options)).filePath || '';
      event.sender.send('did-finish-file-save-dialog', filePath);
    }
  });
  ipcMain.on('did-start-file-open-dialog', async (event: IpcMainEvent, options: OpenDialogOptions): Promise<void> => {
    if (mainWindow != null) {
      winston.log('info', 'File open dialog');
      const filePaths = (await dialog.showOpenDialog(mainWindow, options)).filePaths;
      event.sender.send('did-finish-file-open-dialog', filePaths);
    }
  });
}

export function handleGetFonts(): void {
  ipcMain.on('did-start-getfonts', async (event: IpcMainEvent): Promise<void> => {
    winston.log('info', 'Getting system fonts');
    try {
      const fonts = await fontList.getFonts();
      event.sender.send(
        'did-finish-getfonts',
        // Font names with spaces are wrapped in quotation marks
        fonts.map((font: string) => font.replace(/^"|"$/g, '')).sort()
      );
    } catch (err) {
      event.sender.send('did-finish-getfonts', err);
    }
  });
}

export function handleGetProjects(): void {
  ipcMain.on('did-start-getbkproject', (event: IpcMainEvent, rootDirectories: RootDirectories): void => {
    const projects = flatten(
      map(rootDirectories, (directories: string[], sourceType: string): BKProject[] => {
        const source = SourceIndex.getSource(sourceType);
        // .getBKProject is in /main/sources/hear-this.ts or scripture-app-builder.ts
        return source != null ? source.getBKProjects(directories) : [];
      })
    );
    event.sender.send('did-finish-getbkproject', projects);
  });
}

export function handleSubmission(): void {
  ipcMain.on('did-start-conversion', async (event: IpcMainEvent, args: SubmissionArgs) => {
    const onProgress = ({ status, percent, remainingTime }: ProgressState): void => {
      const progress: ProgressState = { status: `${status} ${percent}%`, percent, remainingTime };
      event.sender.send('on-progress', progress);
    };
    winston.log('info', 'Starting conversion', args);
    let response: string | Error;
    try {
      const source = SourceIndex.getSource(args.project.sourceType);
      if (source == null) {
        throw new Error('Source undefined');
      }
      const project = await source.reloadProject(args.project);
      response = await convert(project, args.combined, args.animationSettings, onProgress);
    } catch (err) {
      response = err as Error;
    }

    let result: SubmissionReturn = { error: new Error('[unknown response]') };
    if (response) {
      result =
        typeof response === 'string'
          ? { outputDirectory: response }
          : { error: { name: 'Error', message: response.message, stack: response.stack } };
    }
    winston.log('info', 'Conversion process finished', result);
    if (result.outputDirectory && fs.existsSync(result.outputDirectory)) {
      shell.openPath(result.outputDirectory);
    }
    event.sender.send('did-finish-conversion', result);
  });
}

app.on('ready', (): void => {
  createWindow();
  handleSubmission();
  handleGetProjects();
  handleGetFonts();
  handleFileDialogs();
});

app.on('window-all-closed', (): void => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', (): void => {
  if (mainWindow == null) {
    createWindow();
  }
});
