import fs from 'fs';
import readdirSorted from 'readdir-sorted';
import shell from 'shelljs';
import tempy from 'tempy';
import path from 'path';
import { FfmpegSettings } from '../../../models/ffmpegSettings.model';
import { paths } from '../path-constants'

export async function execute(settings: FfmpegSettings): Promise<void> {
  const executeAudioPath = await combineAudioIfNecessary(
    settings.audioFileOrFolderPath,
    settings.skipAudioFiles
  );

  return new Promise<void>((resolve, reject) => {
    shell.exec(
      `"${paths.ffmpeg}" -framerate ${settings.framerateIn} -i "${path.join(
        settings.imagesPath,
        'frame_%06d.png'
      )}" -i
      "${executeAudioPath}" ${settings.framerateOut ? `${settings.framerateOut} ` : ''} -pix_fmt yuv420p "${
        settings.outputName
      }"`,
      (code, stdout, stderr) => {
        if (code != 0) {
          const error = new Error(stderr || stdout);
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

export async function combineAudioIfNecessary(
  fileOrFolderPath: string,
  skipAudioFiles: string[]
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // if we have a directory, read the files in the directory
    if (fs.lstatSync(fileOrFolderPath).isDirectory()) {
      // read files in the directory
      readdirSorted(fileOrFolderPath, { numeric: true }).then(async (filesSorted: string[]) => {
        const files = (filesSorted || []).map((fileName: string) => path.join(fileOrFolderPath, fileName)),
          mp3Files = files.filter((f: string) => f.endsWith('.mp3')),
          wavFiles = files.filter((f: string) => f.endsWith('.wav'));

        // If this folder contains wav and mp3 files, then throw error
        if (mp3Files.length > 0 && wavFiles.length > 0) {
          reject(new Error('Conflicting audio types'));
        }
        // if we have wav files, then we merge them into one file
        // and return the combined file path
        else if (wavFiles.length > 0) {
          resolve(await mergeWavFiles(wavFiles, skipAudioFiles));
        }
        // if we have mp3 files, return the glob format with .mp3 files
        else if (mp3Files.length > 0) {
          resolve(getGlobFormat(mp3Files, skipAudioFiles));
        }
      });
    }
    // if we have a wav/mp3 file
    else {
      resolve(fileOrFolderPath);
    }
  });
}

/* Note: FFMPEG cannot merge WAV files and MP3 files in the same way.  MP3 files can be merged using something called
 * the 'concat protocol' while WAV files must be re-encoded and use the 'concat filter'.
 * See https://superuser.com/questions/587511/concatenate-multiple-wav-files-using-single-command-without-extra-file
 * for more information.
 */
export async function mergeWavFiles(wavFiles: string[], skipAudioFiles: string[]): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // NOTE: cannot use glob format with .wav files
    // we will combine them into a single file and use that in our encode.
    // but skip the ones we've been told to skip
    const audioFiles = wavFiles.filter((f) => !skipAudioFiles.includes(f));

    const combinedWavFilePath = path.join(tempy.directory(), 'bbkAudio.wav');
    const fileDir = path.join(path.dirname(combinedWavFilePath), 'listAudioFiles.txt');

    // write a list of wav file to prepare to combine
    let fileText = '';
    audioFiles.forEach((fileName) => {
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

export function getGlobFormat(mp3Files: string[], skipAudioFiles: string[]): string {
  const audioFiles = mp3Files.filter((f) => !skipAudioFiles.includes(f));
  return `concat:${audioFiles.join('|')}`;
}
