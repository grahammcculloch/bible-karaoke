import { OpenDialogOptions, SaveDialogOptions } from '../src/App/components/file-dialog.model';
import { RootDirectories } from '../src/App/models/store.model';
import { SubmissionArgs } from '../src/App/models/submission.model';

export interface API {
  getBKProject: (rootDirectories: RootDirectories) => void;
  onBKProject: (callback: Function) => void;
  saveFile: (options: SaveDialogOptions) => void;
  onFileSave: (callback: Function) => void;
  openFile: (options: OpenDialogOptions) => void;
  onFileOpen: (callback: Function) => void;
  getFonts: () => void;
  onGetFonts: (callback: Function) => void;
  startConversion: (settings: SubmissionArgs) => void;
  onProgress: (callback: function) => void;
  onConversionFinish: (callback: Function) => void;
}

declare global {
  interface Window {
    api: API;
  }
}
