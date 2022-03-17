import fs from 'fs';
import path from 'path';
import {
  app,
  BrowserWindow,
  dialog,
  Event,
  HandlerDetails,
  ipcMain,
  IpcMainEvent,
  Menu,
  NewWindowWebContentsEvent,
  OpenDialogOptions,
  SaveDialogOptions,
  shell,
} from 'electron';
import fontList from 'font-list';
import { map, flatten } from 'lodash';
import winston from 'winston';
import { RootDirectories } from '../src/models/store.model';
import { SubmissionArgs, SubmissionReturn } from '../src/models/submission.model';
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
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (app.isPackaged) {
    // 'build/index.html'
    mainWindow.loadURL(`file://${path.join(__dirname, '../index.html')}`);
    Menu.setApplicationMenu(null);
  } else {
    mainWindow.loadURL('http://localhost:3000/index.html');
    mainWindow.webContents.openDevTools();

    // Hot Reloading on 'node_modules/.bin/electronPath'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron' + (process.platform === 'win32' ? '.cmd' : '')
      ),
      forceHardReset: true,
      hardResetMethod: 'exit',
    });
  }

  mainWindow.maximize();

  mainWindow.on('closed', (): void => {
    mainWindow = undefined;
  });

  // see https://github.com/electron/electron/issues/27967 and https://www.electronjs.org/docs/latest/api/window-open
  mainWindow.webContents.on('new-window', (event: NewWindowWebContentsEvent) => {
    event.preventDefault();
  });
  mainWindow.webContents.on('will-navigate', (event: Event) => {
    event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    if (details.url.startsWith('http:') || details.url.startsWith('https:')) {
      setImmediate(() => {
        shell.openExternal(details.url);
      });
      return { action: 'allow', overrideBrowserWindowOptions: { show: false } };
    } else {
      return { action: 'deny' };
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

app.whenReady().then(async (): Promise<void> => {
  if (!app.isPackaged) {
    const electronDevtoolsInstallerModule = await import('electron-devtools-installer');
    const installExtension = electronDevtoolsInstallerModule.default;
    const { REACT_DEVELOPER_TOOLS } = electronDevtoolsInstallerModule;
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }

  createWindow();
  handleSubmission();
  handleGetProjects();
  handleGetFonts();
  handleFileDialogs();

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', (): void => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});
