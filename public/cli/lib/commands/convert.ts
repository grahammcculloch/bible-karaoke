import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { AnimationSettings } from '../../../models/animationSettings.model';
import { ProgressState } from '../../../models/progressState.model';
import { ProjectData } from '../../../models/projectData.model';
import { BKProject } from '../../../models/projectFormat.model';
import { Timings } from '../../../models/timings.model';
import { render } from '../rendering/renderFrames';
import { RecordFrameEventData } from '../rendering/recordFrames';
import { chapterFormatToTimings } from '../rendering/timings';
import { combineFrames } from './ffmpeg';

export async function convert(
  project: BKProject,
  isCombined: boolean,
  animationSettings: AnimationSettings,
  onProgress: (progress: ProgressState) => void
): Promise<string> {

  // Fix #178: make sure output directory exists
  fs.mkdirSync(animationSettings.output.directory, {recursive: true});
  const outputFilePath = path.join(animationSettings.output.directory, animationSettings.output.filename);
  // const videoPathsToCombine: string[] = [];

  const projectData: ProjectData = { outputLocation: animationSettings.output.directory };
  let percent = 0;
  const onRenderedProgress = ({ currentFrame, totalFrames }: RecordFrameEventData): void => {
    percent = (100 * currentFrame) / totalFrames;
    percent = Math.floor(percent > 100 ? 100 : percent);
    onProgress({ status: 'Rendering video frames...', percent });
  };
  const notify = new EventEmitter();
  notify.addListener('rendered', onRenderedProgress);
  for (const book of project.books) {
    for (const chapter of book.chapters) {
      const timings: Timings = chapterFormatToTimings(chapter);
      await render(animationSettings, projectData, timings, notify);

      const imagesPath = animationSettings.output.directory;
      const outputName = outputFilePath;
      let audioFiles: string[] = [];
      if ('filename' in chapter.audio) {
        audioFiles = [chapter.audio.filename];
      } else {
        audioFiles = chapter.audio.files.map((f) => f.filename);
      }
      onProgress({ status: 'Combining video frames...', percent });
      await combineFrames({ audioFiles, imagesPath, framerateIn: 15, outputName });
      // videoPathsToCombine.push(path.join(args.project.fullPath, args.project.name, book.name, chapter.chapter));
    }
  }
  if (isCombined) {
    // await combineVideos(videoPathsToCombine, outputFilePath);
  }

  return outputFilePath;
}
