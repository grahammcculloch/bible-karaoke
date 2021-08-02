import test from 'ava';
import fs from 'fs';
import path from 'path';
import { mergeWavFiles } from './ffmpeg';
import { testPaths } from '../test/test-path-constants';

test('mergeWavFiles smoke test: multiple files: success', async (t) => {
  const wavFiles = [
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '1.wav'),
    path.join(testPaths.exampleHearThisProject, 'Book1', '1', '2.wav'),
  ];
  const newFilePath = await mergeWavFiles(wavFiles);

  t.true(fs.existsSync(newFilePath));
});
