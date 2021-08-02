import os from 'os';
import path from 'path';

export const DEFAULT_BG_COLOR = '#000';

export const BACKGROUND_TYPE = {
  image: 'image',
  video: 'video',
  color: 'color',
};

// HACK: These values must match the PROJECT_TYPE values in public/sources/*.js
export const PROJECT_TYPE = {
  hearThis: 'hearThis',
  scriptureAppBuilder: 'scriptureAppBuilder',
};

export const TEXT_LOCATION = {
  subtitle: 'subtitle',
  center: 'center',
};

export const DEFAULT_OUTPUT_DIRECTORY = path.join(os.homedir(), 'Bible Karaoke Videos');

const allFiles = {
  name: 'All files',
  extensions: ['*'],
};

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
      extensions: ['jpg', 'png' /*, 'mpeg4', 'mp4', 'webm' */],
    },
  ],
  output: [
    {
      name: 'Video files',
      extensions: ['mp4'],
    },
  ],
};
