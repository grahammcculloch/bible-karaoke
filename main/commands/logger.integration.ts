import test from 'ava';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp-promise';
import winston from 'winston';
import { prepareLogger } from './logger';

test('logger-removes-log-files', async (t) => {
  tmp.setGracefulCleanup();
  const { path: directory, cleanup } = await tmp.dir({ unsafeCleanup: true });
  //Create mock files
  for (let i = 0; i < 10; i++) {
    fs.writeFileSync(path.join(directory, `${i}.txt`), 'test');
  }

  await prepareLogger(5, directory);
  winston.clear();

  const numberOfFiles = fs.readdirSync(directory).length;
  t.is(numberOfFiles, 5);
  cleanup();
});
