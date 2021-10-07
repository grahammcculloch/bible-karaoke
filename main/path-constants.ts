import path from 'path';

export const paths = {
  ffprobe: path.resolve(process.cwd(), 'binaries', process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'),
  ffmpeg: path.resolve(process.cwd(), 'binaries', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
};
