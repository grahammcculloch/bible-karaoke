export interface FfmpegSettings {
  readonly audioFiles: string[];
  readonly imagesPath: string;
  readonly framerateIn: number;
  readonly framerateOut?: number;
  readonly outputName: string;
}
