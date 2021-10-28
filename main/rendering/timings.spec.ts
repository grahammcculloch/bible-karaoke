import test from 'ava';
import { BKChapter } from '../models/projectFormat.model';
import { Timings } from '../models/timings.model';
import { chapterFormatToTimings } from './timings';

test('timings.chapterFormatToTimings test', (t) => {
  const chapter: BKChapter = {
    name: '1',
    audio: {
      files: [
        {
          filename: '0.mp3',
          length: 34600,
        },
        {
          filename: '1.mp3',
          length: 56400,
        },
      ],
    },
    segments: [
      {
        segmentId: 1,
        text: 'In the beginning God created the heavens and the earth.',
        verse: '1',
        startTime: 1040,
        length: 5300,
        isHeading: false,
      },
      {
        segmentId: 2,
        text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
        verse: '2',
        startTime: 7040,
        length: 9300,
        isHeading: false,
      },
      // this segment has no audio and should be skipped
      {
        segmentId: 3,
        text: 'And God said, “Let there be light,” and there was light.',
        verse: '3',
        startTime: 17200,
        length: 5400,
        isHeading: false,
      },
    ],
  };
  const expectedTimings: Timings = [
    {
      type: 'caption',
      index: 1,
      start: 1040,
      end: 6340,
      duration: 5300,
      content: 'In the beginning God created the heavens and the earth.',
      text: '',
      isHeading: false,
      words: [
        { end: 1329, start: 1040, word: 'In' },
        { end: 1714, start: 1329, word: 'the' },
        { end: 2678, start: 1714, word: 'beginning' },
        { end: 3063, start: 2678, word: 'God' },
        { end: 3834, start: 3063, word: 'created' },
        { end: 4219, start: 3834, word: 'the' },
        { end: 4990, start: 4219, word: 'heavens' },
        { end: 5375, start: 4990, word: 'and' },
        { end: 5760, start: 5375, word: 'the' },
        { end: 6340, start: 5760, word: 'earth.' },
      ],
    },
    {
      type: 'caption',
      index: 2,
      start: 7040,
      end: 16340,
      duration: 9300,
      content:
        'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
      text: '',
      isHeading: false,
      words: [
        { end: 7322, start: 7040, word: 'Now' },
        { end: 7604, start: 7322, word: 'the' },
        { end: 8027, start: 7604, word: 'earth' },
        { end: 8309, start: 8027, word: 'was' },
        { end: 8943, start: 8309, word: 'formless' },
        { end: 9225, start: 8943, word: 'and' },
        { end: 9718, start: 9225, word: 'empty,' },
        { end: 10352, start: 9718, word: 'darkness' },
        { end: 10634, start: 10352, word: 'was' },
        { end: 10986, start: 10634, word: 'over' },
        { end: 11268, start: 10986, word: 'the' },
        { end: 11832, start: 11268, word: 'surface' },
        { end: 12043, start: 11832, word: 'of' },
        { end: 12325, start: 12043, word: 'the' },
        { end: 12748, start: 12325, word: 'deep,' },
        { end: 13030, start: 12748, word: 'and' },
        { end: 13312, start: 13030, word: 'the' },
        { end: 13805, start: 13312, word: 'Spirit' },
        { end: 14016, start: 13805, word: 'of' },
        { end: 14298, start: 14016, word: 'God' },
        { end: 14580, start: 14298, word: 'was' },
        { end: 15214, start: 14580, word: 'hovering' },
        { end: 15566, start: 15214, word: 'over' },
        { end: 15848, start: 15566, word: 'the' },
        { end: 16340, start: 15848, word: 'waters.' },
      ],
    },
  ];

  const timings = chapterFormatToTimings(chapter);
  t.is(timings.length, 2);
  t.deepEqual(timings, expectedTimings);
});
