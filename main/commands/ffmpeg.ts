import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp-promise';
import winston from 'winston';
import { FfmpegSettings } from '../models/ffmpegSettings.model';
import { paths } from '../path-constants';

export async function combineFrames(settings: FfmpegSettings): Promise<void> {
  const executeAudioPath = await combineAudioIfNecessary(settings.audioFiles);

  const args = ['-v', 'error'];

  if (settings.backgroundUrl) {
    if (settings.backgroundType === 'image') {
      args.push('-framerate', settings.framerateIn.toString());
    }
    args.push('-stream_loop', '-1', '-t', settings.audioDuration.toString(), '-i', settings.backgroundUrl);
  }

  args.push('-framerate', settings.framerateIn.toString(), '-i', path.join(settings.imagesPath, 'frame_%06d.png'));

  if (executeAudioPath != null) {
    args.push('-i', executeAudioPath);
  }

  // combine background image/video with bkframes
  if (settings.backgroundType === 'image' || settings.backgroundType === 'video') {
    args.push(
      '-filter_complex',
      '[0:v] scale=round(iw*max(720/iw\\,480/ih)):round(ih*max(720/iw\\,480/ih)), crop=720:480 [crop]; [crop][1:v] overlay [layered]',
      '-map',
      '[layered]'
    );
    if (executeAudioPath != null) {
      args.push('-map', '2:a');
    }
    args.push('-c:v', 'libx264');
    args.push('-shortest');
  }

  if (settings.framerateOut != null) {
    args.push('-r', settings.framerateOut.toString());
  }

  args.push('-pix_fmt', 'yuv420p', settings.outputName);

  const ffmpegProcess = spawnSync(paths.ffmpeg, args, { stdio: 'pipe' });

  //Check for errors running ffmpeg
  const stderr = ffmpegProcess.stderr.toString();
  if (stderr !== '') {
    winston.error(stderr);
    throw new Error(stderr);
  }
}

export async function combineAudioIfNecessary(audioFiles: string[]): Promise<string | undefined> {
  if (audioFiles.length === 1) {
    // if we only have 1 file return it
    return audioFiles[0];
  } else {
    // Separate mp3 and wav files
    const mp3Files = audioFiles.filter((f: string) => f.toLowerCase().endsWith('.mp3'));
    const wavFiles = audioFiles.filter((f: string) => f.toLowerCase().endsWith('.wav'));

    if (mp3Files.length + wavFiles.length !== audioFiles.length) {
      // if there are more then just wav and mp3 files, then throw error
      winston.error('Unsupported audio types');
      throw new Error('Unsupported audio types');
    } else if (mp3Files.length > 0 && wavFiles.length > 0) {
      // if there are a combination of wav and mp3 files, then throw error
      winston.error('Conflicting audio types');
      throw new Error('Conflicting audio types');
    } else if (wavFiles.length > 0) {
      // if we have wav files, then we merge them into one file and return the combined file path
      return await mergeWavFiles(wavFiles);
    } else if (mp3Files.length > 0) {
      // if we have mp3 files, return the glob format with .mp3 files
      return getGlobFormat(mp3Files);
    }
  }
}

/* Note: FFMPEG cannot merge WAV files and MP3 files in the same way.  MP3 files can be merged using something called
 * the 'concat protocol' while WAV files must be re-encoded and use the 'concat filter'.
 * See https://superuser.com/questions/587511/concatenate-multiple-wav-files-using-single-command-without-extra-file
 * for more information.
 */
export async function mergeWavFiles(wavFiles: string[]): Promise<string> {
  const { path: directory } = await tmp.dir();
  // NOTE: cannot use glob format with .wav files. We will combine them into a single file and use that in our encode.
  const combinedWavFilePath = path.join(directory, 'bbkAudio.wav');
  const fileDir = path.join(directory, 'listAudioFiles.txt');

  // write a list of wav file to prepare to combine
  let fileText = '';
  wavFiles.forEach((fileName) => {
    if (!path.isAbsolute(fileName)) {
      fileName = path.join(process.cwd(), fileName);
    }

    fileText += `file '${fileName}'\n`;
  });
  fs.writeFileSync(fileDir, fileText);

  const args = ['-f', 'concat', '-safe', '0', '-i', fileDir, '-c', 'copy', combinedWavFilePath];
  // Do not echo the console output (ignore stdout).
  const ffmpegProcess = spawnSync(paths.ffmpeg, args, { stdio: 'ignore' });

  //Check for errors running ffmpeg
  const stderr = ffmpegProcess.stderr?.toString() ?? '';
  if (stderr !== '') {
    winston.error(stderr);
    throw new Error(stderr);
  }

  return combinedWavFilePath;
}

export function getGlobFormat(mp3Files: string[]): string {
  return `concat:${mp3Files.join('|')}`;
}
