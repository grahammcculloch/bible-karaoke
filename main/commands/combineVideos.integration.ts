import { readdirSync } from 'fs';
import { resolve } from 'path';
import test from 'ava';
import tmp from 'tmp-promise';
import winston from 'winston';
import { combineVideos } from './combineVideos';

winston.add(new winston.transports.Console({ silent: true }));

test('combine two videos', async (t) => {
  tmp.setGracefulCleanup();
  const { path: directory, cleanup } = await tmp.dir({ unsafeCleanup: true });
  const videoPaths = [resolve(__dirname, '../test/videos/small.avi'), resolve(__dirname, '../test/videos/small2.avi')];
  const outputFilePath = resolve(directory, 'myvideo.avi');

  await combineVideos(videoPaths, outputFilePath);

  const files = readdirSync(directory);
  t.is(files.length, 1);
  cleanup();
});

test('should throw if file exists', async (t) => {
  tmp.setGracefulCleanup();
  const { path: directory, cleanup } = await tmp.dir({ unsafeCleanup: true });
  const videoPaths = [resolve(__dirname, '../test/videos/small.avi'), resolve(__dirname, '../test/videos/small2.avi')];
  const outputFilePath = resolve(directory, 'myvideo.avi');
  await combineVideos(videoPaths, outputFilePath);
  const files = readdirSync(directory);
  t.is(files.length, 1);

  await t.throwsAsync(async () => await combineVideos(videoPaths, outputFilePath), {
    instanceOf: Error,
    message: /myvideo.avi' already exists./,
  });

  cleanup();
});
