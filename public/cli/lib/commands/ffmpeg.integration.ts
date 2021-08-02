import test from 'ava';
import fs from 'fs';
import path from 'path';
import { combineFrames, mergeWavFiles } from './ffmpeg';
import { testPaths } from '../test/test-path-constants';
import tempy from 'tempy';

test('mergeWavFiles smoke test: multiple files: success', async (t) => {
  const wavFiles = [
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '1.wav'),
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '2.wav'),
  ];
  const newFilePath = await mergeWavFiles(wavFiles);

  t.true(fs.existsSync(newFilePath));
});

test('ffmpeg combineFrames creates video', async (t) => {
  await tempy.directory.task(async (dir: string) => {
    const ffmpegSettings = {
      audioFiles: [
        path.join(testPaths.exampleHearThisProject, 'Book1', '1', '1.wav'),
        path.join(testPaths.exampleHearThisProject, 'Book1', '1', '2.wav'),
      ],
      imagesPath: testPaths.frameImages,
      framerateIn: 15,
      framerateOut: 15,
      outputName: path.join(dir, 'test.mp4'),
    };
    await combineFrames(ffmpegSettings);
    t.true(fs.existsSync(ffmpegSettings.outputName));
  });
});
