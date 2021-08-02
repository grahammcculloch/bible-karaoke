export interface FfmpegSettings {
  readonly audioFileOrFolderPath: string;
  readonly skipAudioFiles: string[];
  readonly imagesPath: string;
  readonly framerateIn: number;
  readonly framerateOut: number;
  readonly outputName: string;
}
