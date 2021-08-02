import test from 'ava';
import { getGlobFormat } from './ffmpeg';

test('getGlobFormat: nothing skipped: expected format', (t) => {
  const mp3Files = ['one.mp3', 'two.mp3'];

  t.is(getGlobFormat(mp3Files), 'concat:one.mp3|two.mp3');
});
