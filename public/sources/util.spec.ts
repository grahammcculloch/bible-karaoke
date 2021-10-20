import test from 'ava';
import { sortInCanonicalOrder, isValidAudioFile } from './util';

test('sorts books canonically', (t) => {
  const bookNames = ['Revelation', 'Genesis', 'Matthew', 'Psalms'];
  t.deepEqual(sortInCanonicalOrder(bookNames), ['Genesis', 'Psalms', 'Matthew', 'Revelation']);
});

test('appends unrecognised books to end', (t) => {
  const bookNames = ['Revelation', 'Genesis', 'Not-a-book', 'Matthew', 'Psalms'];
  t.deepEqual(sortInCanonicalOrder(bookNames), ['Genesis', 'Psalms', 'Matthew', 'Revelation', 'Not-a-book']);
});

test('check valid audio file', (t) => {
  const fileName = 'file.mp4';
  const defaultXmlName = 'index.xml';
  const audioFilters = ['mp4', 'webm'];
  t.true(isValidAudioFile(fileName, defaultXmlName, audioFilters));
});

test('check not valid audio file', (t) => {
  const fileName = 'file.mp4';
  const defaultXmlName = 'index.xml';
  const audioFilters = ['webm', 'avi'];
  t.false(isValidAudioFile(fileName, defaultXmlName, audioFilters));
});

test('check is xml file', (t) => {
  const fileName = 'index.xml';
  const defaultXmlName = 'index.xml';
  const audioFilters = ['mp4', 'webm'];
  t.false(isValidAudioFile(fileName, defaultXmlName, audioFilters));
});
