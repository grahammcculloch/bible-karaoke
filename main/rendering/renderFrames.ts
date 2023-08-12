import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import DataURI from 'datauri';
import { template } from 'lodash';
import { BACKGROUND_TYPE } from '../../src/App/constants';
import { AnimationSettings } from '../../src/models/animationSettings.model';
import { Timings } from '../models/timings.model';
import { record } from './recordFrames';

export async function render(
  animationSettings: AnimationSettings,
  frameDirectory: string,
  timings: Timings,
  notify?: EventEmitter
): Promise<void> {
  const logEachFrame = false;
  const fps = 15;
  const htmlContent = await getHtml(timings, animationSettings, fps);
  const durationInSeconds = timings[timings.length - 1].end / 1000;
  await record(htmlContent, Math.round(durationInSeconds * fps), frameDirectory, logEachFrame, notify);
}

export async function getHtml(timings: Timings, animationSettings: AnimationSettings, fps = 15): Promise<string> {
  const htmlTemplate = template(fs.readFileSync(path.join(__dirname, 'render.html'), { encoding: 'utf-8' }));
  const backgroundDataUri =
    animationSettings.background.file && animationSettings.background.type == BACKGROUND_TYPE.image
      ? await DataURI.promise(animationSettings.background.file)
      : null;
  const data = {
    timings: JSON.stringify(timings),
    fps,
    animationSettings,
    backgroundDataUri,
  };
  return htmlTemplate(data);
}
