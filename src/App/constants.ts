import { BackgroundType, TextLocationLocation } from '../models/animationSettings.model';

export const DEFAULT_BG_COLOR = '#000';

export const BACKGROUND_TYPE: { image: BackgroundType; video: BackgroundType; color: BackgroundType } = {
  image: 'image',
  video: 'video',
  color: 'color',
};

export const SOURCE_TYPES = {
  hearThis: 'hearThis',
  scriptureAppBuilder: 'scriptureAppBuilder',
};

export const TEXT_LOCATION: { subtitle: TextLocationLocation; center: TextLocationLocation } = {
  subtitle: 'subtitle',
  center: 'center',
};

const allFiles = {
  name: 'All files',
  extensions: ['*'],
};

export const IMAGE_BG_EXTS = ['jpg', 'png', 'jpeg'];

export const VIDEO_BG_EXTS = ['mp4', 'webm', 'mov'];

export const fileFilters = {
  text: [
    {
      name: 'Text files',
      extensions: ['txt'],
    },
    allFiles,
  ],
  audio: [
    {
      name: 'Audio files',
      extensions: ['mp3', 'wav'],
    },
    allFiles,
  ],
  timing: [
    {
      name: 'Timing files',
      extensions: ['txt'],
    },
    allFiles,
  ],
  background: [
    {
      name: 'Background files',
      extensions: [...IMAGE_BG_EXTS, ...VIDEO_BG_EXTS],
    },
  ],
  output: [
    {
      name: 'Video files',
      extensions: ['mp4'],
    },
  ],
};
