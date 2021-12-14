import { ProgressState } from '../main/models/progressState.model';
import { BKProject } from '../main/models/projectFormat.model';
import { OpenDialogOptions, SaveDialogOptions } from '../src/App/components/file-dialog.model';
import { RootDirectories } from '../src/App/models/store.model';
import { SubmissionArgs, SubmissionReturn } from '../src/App/models/submission.model';

export interface API {
  getBKProject: (rootDirectories: RootDirectories) => void;
  onBKProject: (callback: (projects: BKProject[]) => void) => void;
  saveFile: (options: SaveDialogOptions) => void;
  onFileSave: (callback: (saveFilePath: string) => void) => void;
  openFile: (options: OpenDialogOptions) => void;
  onFileOpen: (callback: (openFilePath: string) => void) => void;
  getFonts: () => void;
  onGetFonts: (callback: (newFonts: string[] | Error) => void) => void;
  startConversion: (settings: SubmissionArgs) => void;
  onProgress: (callback: (progress: ProgressState) => void) => void;
  onConversionFinish: (callback: (result: SubmissionReturn) => void) => void;
}

declare global {
  interface Window {
    api: API;
  }
}
