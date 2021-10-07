import path from 'path';
import { testPaths } from '../../../../test/test-path-constants';

export const scenario1 = {
  input: {
    project: {
      name: testPaths.exampleHearThisProjectName,
      fullPath: testPaths.exampleHearThisProjectPath,
      books: [
        {
          name: 'Book1',
          chapters: [
            {
              name: '0',
            },
          ],
        },
      ],
    },
  },
  output: {
    name: testPaths.exampleHearThisProjectName,
    dirName: testPaths.exampleHearThisProjectPath,
    books: [
      {
        name: 'Book1',
        chapters: [
          {
            name: '0',
            audio: {
              files: [
                { filename: path.join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '0.wav'), length: 2300 },
                { filename: path.join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '1.wav'), length: 5500 },
                { filename: path.join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '2.wav'), length: 9500 },
              ],
              length: 17300,
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
              {
                segmentId: 2,
                text: 'Li Kalòcè̌ mè mwaǐ Pò̌lu tyanba Wein Kalòcè̌ ta-aòblonphao.',
                verse: '0',
                startTime: 2300,
                length: 5500,
                isHeading: false,
              },
              {
                segmentId: 3,
                text: 'Wein Kalòcè̌ ǔ mè aò bǎ Kǎn Asǐyǎ, Wein Ěphěsu amô̌nhtan dò aò dô̌ Rǒme tapain kalǎ.',
                verse: '0',
                startTime: 7800,
                length: 9500,
                isHeading: false,
              },
            ],
          },
        ],
      },
    ],
  },
};
