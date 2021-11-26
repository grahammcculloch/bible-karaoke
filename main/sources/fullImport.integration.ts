import { join } from 'path';
import test from 'ava';
import { BKProject } from '../models/projectFormat.model';
import { testPaths } from '../test/test-path-constants';
import SourceIndex from './index';

test('read-and-import-ht-project', (t) => {
  const source = SourceIndex.getSource('hearThis');
  const project = source != null ? source.getBKProjects([testPaths.fixtures]) : [];
  const actual = source != null ? source.reloadProject(project[0]) : [];
  t.deepEqual(actual, expected);
});

const expected: BKProject = {
  name: testPaths.exampleHearThisProjectName,
  folderPath: testPaths.exampleHearThisProjectPath,
  sourceType: 'hearThis',
  books: [
    {
      name: 'Book1',
      chapters: [
        {
          name: '0',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '0.wav'),
                length: 2300,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '1.wav'),
                length: 5500,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '0', '2.wav'),
                length: 9500,
              },
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
        {
          name: '1',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '1', '1.wav'),
                length: 3200,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '1', '2.wav'),
                length: 6500,
              },
            ],
            length: 9700,
          },
          segments: [
            {
              segmentId: 2,
              text: 'Tamangaò̌ raò̌rî rî̌kaò̌',
              verse: '0',
              startTime: 0,
              length: 3200,
              isHeading: true,
            },
            {
              segmentId: 3,
              text: 'Tô̌, pracǎnsû̌, prathácô̌n dò Khrī, thapǔwaǐ Wein Kalòcè̌phao aò.',
              verse: '1-2',
              startTime: 3200,
              length: 6500,
              isHeading: false,
            },
          ],
        },
        {
          name: '2',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '2', '1.wav'),
                length: 13600,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '2', '2.wav'),
                length: 16500,
              },
            ],
            length: 30100,
          },
          segments: [
            {
              segmentId: 2,
              text: 'Khǐ thayû̌ daô theingǎ nathû̌ bakyadò khǐ rwǎn ma dô̌ nathû̌ ngǎ cwaǐmǎ, dô̌ Wein Lò̌dikǐphao ngǎ dò pra cô̌ usûba khǐ lakhan lakhan ngǎ cwaǐmǎ arîkaǐ.',
              verse: '1',
              startTime: 0,
              length: 13600,
              isHeading: false,
            },
            {
              segmentId: 3,
              text: 'Khǐ rwǎn ma cwaǐdò nathû̌ thá ka nî̌ba tamamo, ka aòbloncǔ dò tabathá, ka aòbábwaǐ dò tanāpau byan raò́ cwaǐdò ka theingǎ byan Bweca ta-aòhu aòbî mè mwaǐ Khrī.',
              verse: '2',
              startTime: 13600,
              length: 16500,
              isHeading: false,
            },
          ],
        },
        {
          name: '3',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book1', '3', '0.wav'),
                length: 1400,
              },
            ],
            length: 1400,
          },
          segments: [
            {
              segmentId: 1,
              text: 'Khǐ rwǎn ma cwaǐdò nathû̌ thá ka nî̌ba tamamo, ka aòbloncǔ dò tabathá, ka aòbábwaǐ dò tanāpau byan raò́ cwaǐdò ka theingǎ byan Bweca ta-aòhu aòbî mè mwaǐ Khrī.',
              verse: '2',
              startTime: 0,
              length: 1400,
              isHeading: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Book2',
      chapters: [
        {
          name: '0',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '0', '1.wav'),
                length: 7600,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '0', '2.wav'),
                length: 20000,
              },
            ],
            length: 27600,
          },
          segments: [
            {
              segmentId: 2,
              text: 'Ngaò̌mò̌n',
              verse: '0',
              startTime: 0,
              length: 7600,
              isHeading: true,
            },
            {
              segmentId: 3,
              text: 'Tô̌ Pracǎnsû̌ dò pra thácô̌n dò Khrī YeSyǔ aò bǎ Wein Ephesu.',
              verse: '1',
              startTime: 7600,
              length: 20000,
              isHeading: false,
            },
          ],
        },
        {
          name: '1',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '1', '1.wav'),
                length: 10500,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '1', '2.wav'),
                length: 12400,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '1', '3.wav'),
                length: 11500,
              },
            ],
            length: 34400,
          },
          segments: [
            {
              segmentId: 2,
              text: 'Bweca marîmaraò́ pa dô̌ Khrī YeSyǔ khaucǎ',
              verse: '0',
              startTime: 0,
              length: 10500,
              isHeading: true,
            },
            {
              segmentId: 3,
              text: 'Lǎrî̌hǎ nathû̌ mwaǐ takhòwèphao dò ma takarǎn katǎ khaucǎ nathû̌ mwaǐ pra thû̌kaǐ.',
              verse: '1',
              startTime: 10500,
              length: 12400,
              isHeading: false,
            },
            {
              segmentId: 4,
              text: 'Beǐnu hǎ nathû̌ macǔ kǎn ǔ caǔ atadaô dò nathû̌ nadeǐn takrau tayaò aò dô̌ maolǎ laǒlǎn akhau.',
              verse: '2',
              startTime: 22900,
              length: 11500,
              isHeading: false,
            },
          ],
        },
        {
          name: '2',
          audio: {
            files: [
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '2', '2.wav'),
                length: 23200,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '2', '3.wav'),
                length: 10100,
              },
              {
                filename: join(testPaths.exampleHearThisProjectPath, 'Book2', '2', '4.wav'),
                length: 10400,
              },
            ],
            length: 43700,
          },
          segments: [
            {
              segmentId: 3,
              text: 'Akhaucǎ khǐ Pò̌lu, Khrī YeSyǔ pralau lanba dô̌ htòn kaǔ dô̌ nathû̌ pracô̌mwaǐ Yǔdaphao ngǎ.',
              verse: '1',
              startTime: 0,
              length: 23200,
              isHeading: false,
            },
            {
              segmentId: 4,
              text: 'Khǐ yû̌ dô̌ nathû̌ nāhyû̌n ba hô̌ Bweca atamarî maraò́ dò atadaô lanba khǐ dô̌ nathû̌ ngǎ rîkaǐ dò Bweca daô nāpau khǐ ta-aò hu aòbi dô̌ tadaôlaô̌ akaǔ thamǎ mè khǐ tyan ba hô̌ nathû̌ cwaǐ kakhau nu laki .',
              verse: '2~3',
              startTime: 23200,
              length: 10100,
              isHeading: false,
            },
            {
              segmentId: 5,
              text: 'Dò nathû̌ mwaǐ pha ba khǐ tatyan mè ka theingǎ khǐ tanāpau Khrī ta-aò hu aòbi aò thamǎ nè.',
              verse: '4',
              startTime: 33300,
              length: 10400,
              isHeading: false,
            },
          ],
        },
      ],
    },
  ],
};
