import test from 'ava';
import { ConvertProject } from '../../models/convertFormat.model';
import { testPaths } from '../../test/test-path-constants';
import { getProjectStructure } from './readStructure';

test('reads-hearthis-project-structure', (t) => {
  const actual = getProjectStructure([testPaths.fixtures]);
  const expected: Array<ConvertProject> = [
    {
      name: testPaths.exampleHearThisProjectName,
      fullPath: testPaths.exampleHearThisProjectPath,
      books: [
        { name: 'Book1', chapters: [{ name: '0' }, { name: '1' }, { name: '2' }, { name: '3' }] },
        { name: 'Book2', chapters: [{ name: '0' }, { name: '1' }, { name: '2' }] },
      ],
    },
  ];
  t.deepEqual(actual, expected);
});
