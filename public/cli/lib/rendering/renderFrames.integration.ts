import test from 'ava';
import { render } from './renderFrames';
import { chapterFormatToTimings } from './timings';
import { AnimationSettings } from '../../../models/animationSettings.model';
import { testPaths } from '../test/test-path-constants';
import { join } from 'path';
import tempy from 'tempy';
import fs from 'fs';

test('render frames with htmlContent', async (t) => {
  const timings = chapterFormatToTimings(bkChapter);
  await tempy.directory.task(async (dir: string) => {
    const projectData = {
      outputLocation: dir,
    };
    await render(animationSettings, projectData, timings);
    const directoryOfFrameFiles = fs.readdirSync(dir);
    t.is(directoryOfFrameFiles.length, 35);
  });
});

const animationSettings: AnimationSettings  = {
  text: {
    fontFamily: "",
    fontSize: 12,
    color: "black",
    bold: false,
    italic: false,
    highlightColor: "white",
    highlightRGB: "",
  },
  background: {
    color: "red",
    type: "color",
  },
  speechBubble: {
    color: "yellow",
    rgba: "",
    opacity: 80,
  },
  output: { directory: "", filename: ""},
  textLocation: { location: "center", },
  };

const bkChapter  = {
  book: 'Book1',
  chapter: '0',
  audio: {
    files: [
      {
        filename: join(testPaths.exampleHearThisProject, 'Book1', '0', '0.wav'),
        length: 2300,
      },
    ],
    length: 2300,
  },
  segments: [
    {
      segmentId: 1,
      text: 'Li Kalòcè̌ tatai theingǎ',
      verse: '0',
      startTime: 0,
      length: 2300,
      isHeading: true,
    },
  ],
};
