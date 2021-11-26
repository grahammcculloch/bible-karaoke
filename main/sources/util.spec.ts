import test from 'ava';
import { sortInCanonicalOrder } from './util';

test('sorts books canonically', (t) => {
  const bookNames = ['Revelation', 'Genesis', 'Matthew', 'Psalms'];
  t.deepEqual(sortInCanonicalOrder(bookNames), ['Genesis', 'Psalms', 'Matthew', 'Revelation']);
});

test('appends unrecognised books to end', (t) => {
  const bookNames = ['Revelation', 'Genesis', 'Not-a-book', 'Matthew', 'Psalms'];
  t.deepEqual(sortInCanonicalOrder(bookNames), ['Genesis', 'Psalms', 'Matthew', 'Revelation', 'Not-a-book']);
});
