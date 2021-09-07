export interface FfmpegSettings {
  readonly audioFiles: string[];
  readonly imagesPath: string;
  readonly framerateIn: number;
  readonly framerateOut?: number;
  readonly outputName: string;
  readonly backgroundType: string | undefined;
  readonly backgroundVideoUrl: string | undefined;
}
