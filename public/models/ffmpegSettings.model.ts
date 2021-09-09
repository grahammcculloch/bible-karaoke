export interface FfmpegSettings {
  readonly audioFiles: string[];
  readonly audioDuration: number; // seconds
  readonly imagesPath: string;
  readonly framerateIn: number;
  readonly framerateOut?: number;
  readonly outputName: string;
  readonly backgroundType: string | undefined;
  readonly backgroundUrl: string | undefined;
}
