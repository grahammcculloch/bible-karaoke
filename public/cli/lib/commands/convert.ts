import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp-promise';
import { AnimationSettings } from '../../../models/animationSettings.model';
import { ProgressState } from '../../../models/progressState.model';
import { BKProject } from '../../../models/projectFormat.model';
import { Timings } from '../../../models/timings.model';
import { render } from '../rendering/renderFrames';
import { RecordFrameEventData } from '../rendering/recordFrames';
import { chapterFormatToTimings } from '../rendering/timings';
import { combineFrames } from './ffmpeg';
import { combineVideos } from './combineVideos';

export async function convert(
  project: BKProject,
  isCombined: boolean,
  animationSettings: AnimationSettings,
  onProgress: (progress: ProgressState) => void
): Promise<string> {
  // Fix #178: make sure output directory exists
  fs.mkdirSync(animationSettings.output.directory, { recursive: true });
  let outputFilePath = path.join(animationSettings.output.directory, animationSettings.output.filename);
  const videoPathsToCombine: string[] = [];
  let percent = 0;
  let chapterIndex = 0;
  const totalChapters = getTotalChapters(project);
  const progressSegment = 100 / totalChapters;

  const onRenderedProgress = ({ currentFrame, totalFrames }: RecordFrameEventData): void => {
    const progressStart = progressSegment * chapterIndex;
    const segmentRatio = currentFrame / totalFrames;
    percent = segmentRatio * progressSegment + progressStart;
    const remainingTime: string = calculateRemainTime(percent, startDate);
    percent = Math.floor(percent > 100 ? 100 : percent);
    onProgress({ status: 'Rendering video frames...', percent, remainingTime });
  };
  const notify = new EventEmitter();
  notify.addListener('rendered', onRenderedProgress);
  tmp.setGracefulCleanup();
  const { path: combineDirectory, cleanup: cleanupCombineDirectory } = await tmp.dir({ unsafeCleanup: true });
  const startDate = new Date();
  for (const book of project.books) {
    for (const chapter of book.chapters) {
      const { path: imagesPath, cleanup: cleanupImagesPath } = await tmp.dir({ unsafeCleanup: true });

      const timings: Timings = chapterFormatToTimings(chapter);
      await render(animationSettings, imagesPath, timings, notify);
      chapterIndex += 1;

      let outputName = getOutputFilePath(
        isCombined,
        combineDirectory,
        animationSettings.output.directory,
        project.name,
        book.name,
        chapter.name
      );
      if (!isCombined) {
        outputName = checkOverwrite(outputName, animationSettings.output.overwriteOutputFiles);
      }
      let audioFiles: string[] = [];
      if ('filename' in chapter.audio) {
        audioFiles = [chapter.audio.filename];
      } else {
        audioFiles = chapter.audio.files.map((f) => f.filename);
      }
      let audioDuration = 0;
      if (chapter.audio.length) {
        audioDuration = chapter.audio.length;
      } else if ('files' in chapter.audio) {
        chapter.audio.files.forEach((f) => (audioDuration += f.length));
      }
      audioDuration = audioDuration / 1000;
      onProgress({ status: 'Combining video frames...', percent });
      await combineFrames({
        audioFiles,
        audioDuration,
        imagesPath,
        framerateIn: 15,
        outputName,
        backgroundType: animationSettings.background.type,
        backgroundUrl: animationSettings.background.file,
      });
      if (isCombined) {
        videoPathsToCombine.push(outputName);
      }
      cleanupImagesPath();
    }
  }
  if (videoPathsToCombine.length > 0) {
    outputFilePath = checkOverwrite(outputFilePath, animationSettings.output.overwriteOutputFiles);
    await combineVideos(videoPathsToCombine, outputFilePath);
  }
  cleanupCombineDirectory();

  return animationSettings.output.directory;
}

export function checkOverwrite(outputFilePath: string, overwriteOutputFiles: boolean): string {
  let filePath = outputFilePath;
  // check if output file already exists:
  if (fs.existsSync(filePath)) {
    if (overwriteOutputFiles) {
      // remove the existing file
      fs.unlinkSync(filePath);
    } else {
      // get a list of all the files in the directory,
      const listAllFiles = fs.readdirSync(path.dirname(outputFilePath), 'utf8');
      // get a count of the ones that have a similar start name
      const nameParts = path.parse(filePath);
      const copyFilenamePattern = new RegExp(`^${nameParts.name} \\((\\d+)\\)${nameParts.ext}$`, 'm');
      const copyFilenames = (listAllFiles ?? [])
        .filter((f) => f !== nameParts.base && f.match(copyFilenamePattern))
        .sort();
      const highestFilename = copyFilenames.reverse()[0] ?? '';
      //parse copy count from filename
      const highestFilenameCopyCount = parseInt((highestFilename.match(copyFilenamePattern) ?? [])[1] ?? 0);
      const copyCount = highestFilenameCopyCount + 1;
      // since they want to keep the file then modify the filename - new filename = name (copyCount).ext
      filePath = path.join(nameParts.dir, `${nameParts.name} (${copyCount})${nameParts.ext}`);
    }
  }
  return filePath;
}

function calculateRemainTime(percent: number, startDate: Date): string {
  let result = '';
  const currentDate: Date = new Date();

  const totalTime = currentDate.valueOf() - startDate.valueOf(); // milliseconds

  const estimateTime = (totalTime / percent) * (100 - percent); // milliseconds

  // Convert milliseconds to days, hours, minutes, seconds
  const days: number = parseFloat((estimateTime / 86400000).toFixed(0));
  const hours: number = parseFloat((estimateTime / 3600000).toFixed(0));
  const minutes: number = parseFloat((estimateTime / 60000).toFixed(0));
  const seconds: number = parseFloat((estimateTime / 1000).toFixed(0));

  if (seconds < 1) {
    result = '';
  } else if (seconds < 60) {
    result = `${seconds} second${seconds > 1 ? 's' : ''}`;
  } else if (minutes == 1) {
    result = `1 minute ${seconds - 60} seconds`;
  } else if (minutes < 60) {
    result = `${minutes} minutes`;
  } else if (hours < 24) {
    result = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    result = `${days} day${days > 1 ? 's' : ''}`;
  }

  if (result) {
    result = `Approximately ${result} remaining`;
  }

  return result;
}

function getOutputFilePath(
  isCombined: boolean,
  combineDirectory: string,
  outputDirectory: string,
  projectName: string,
  bookName: string,
  chapterName: string
): string {
  // Mii_Mark_1.mp4, Mii_Mark_2.mp4, Mii_Mark_3.mp4, Mii_Mark_4.mp4
  const outputFilename = `${projectName}_${bookName}_${chapterName}.mp4`;
  if (isCombined) {
    // when combining the output, then generate multiple files in a temp directory ready to combine.
    return path.join(combineDirectory, outputFilename);
  } else {
    // when not combining the output, then generate multiple files.
    return path.join(outputDirectory, outputFilename);
  }
}

function getTotalChapters(project: BKProject): number {
  let total = 0;
  for (const book of project.books) {
    total += book.chapters.length;
  }
  return total;
}
