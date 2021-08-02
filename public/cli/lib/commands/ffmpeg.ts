import fs from 'fs';
import shell from 'shelljs';
import { spawnSync } from 'child_process';
import tempy from 'tempy';
import path from 'path';
import { FfmpegSettings } from '../../../models/ffmpegSettings.model';
import { paths } from '../path-constants';

export async function combineFrames(settings: FfmpegSettings): Promise<void> {
  const executeAudioPath = await combineAudioIfNecessary(settings.audioFiles);
  //Arguments for ffmpeg
  const args = [
    '-framerate',
    settings.framerateIn.toString(),
    '-loglevel',
    'error',
    '-i',
    path.join(settings.imagesPath, 'frame_%06d.png'),
    '-i',
    executeAudioPath,
    '-pix_fmt',
    'yuv420p',
    settings.outputName,
  ];
  if (settings.framerateOut != null) {
    args.push('-r', settings.framerateOut.toString());
  }

  const ffmpegProcess = spawnSync(paths.ffmpeg, args, { stdio: 'pipe' });

  //Check for errors running ffmpeg
  const stderr = ffmpegProcess.stderr.toString();
  if (stderr !== '') {
    throw new Error(stderr);
  }
}

export async function combineAudioIfNecessary(audioFiles: string[]): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    // if we have a directory, read the files in the directory
    if (audioFiles.length > 1) {
      // Separate mp3 and wav files
      const mp3Files = audioFiles.filter((f: string) => f.endsWith('.mp3'));
      const wavFiles = audioFiles.filter((f: string) => f.endsWith('.wav'));
      // If this folder contains wav and mp3 files, then throw error
      if (mp3Files.length > 0 && wavFiles.length > 0) {
        reject(new Error('Conflicting audio types'));
      }
      // if we have wav files, then we merge them into one file
      // and return the combined file path
      else if (wavFiles.length > 0) {
        resolve(await mergeWavFiles(wavFiles));
      }
      // if we have mp3 files, return the glob format with .mp3 files
      else if (mp3Files.length > 0) {
        resolve(getGlobFormat(mp3Files));
      }
    }
    // if we only have 1 file return it
    else {
      resolve(audioFiles[0]);
    }
  });
}

/* Note: FFMPEG cannot merge WAV files and MP3 files in the same way.  MP3 files can be merged using something called
 * the 'concat protocol' while WAV files must be re-encoded and use the 'concat filter'.
 * See https://superuser.com/questions/587511/concatenate-multiple-wav-files-using-single-command-without-extra-file
 * for more information.
 */
export async function mergeWavFiles(wavFiles: string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // NOTE: cannot use glob format with .wav files
    // we will combine them into a single file and use that in our encode.

    const combinedWavFilePath = path.join(tempy.directory(), 'bbkAudio.wav');
    const fileDir = path.join(path.dirname(combinedWavFilePath), 'listAudioFiles.txt');

    // write a list of wav file to prepare to combine
    let fileText = '';
    wavFiles.forEach((fileName) => {
      if (!path.isAbsolute(fileName)) {
        fileName = path.join(process.cwd(), fileName);
      }

      fileText += `file '${fileName}'\n`;
    });
    fs.writeFileSync(fileDir, fileText);

    // combine wav files
    shell.exec(
      `"${paths.ffmpeg}" -f concat -safe 0 -i "${fileDir}" -c copy "${combinedWavFilePath}"`,
      { silent: true },
      (err) => {
        err ? reject(err) : resolve(combinedWavFilePath);
      }
    );
  });
}

export function getGlobFormat(mp3Files: string[]): string {
  return `concat:${mp3Files.join('|')}`;
}
