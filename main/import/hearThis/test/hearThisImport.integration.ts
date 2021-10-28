import test, { ExecutionContext } from 'ava';
import { map } from 'lodash';
import { ConvertProject } from '../../../models/convertFormat.model';
import { BKProject } from '../../../models/projectFormat.model';
import { bkImport } from '../hearThisImport';
import { scenarios } from './scenarios';

interface Scenario {
  input: { project: ConvertProject };
  output: BKProject;
}

const testScenario = async (scenario: Scenario, t: ExecutionContext<unknown>): Promise<void> => {
  const { input, output } = scenario;
  const bkProject = await bkImport(input.project);
  output.books.forEach((book, i) => {
    book.chapters.forEach((chapter, j) => {
      const bkChapter = bkProject.books[i].chapters[j];
      t.deepEqual(bkChapter, chapter);
    });
  });
};

test('hearThisImport converts test folders as expected', async (t) => {
  t.plan(scenarios.length);
  await Promise.all(map(scenarios, (scenario: Scenario) => testScenario(scenario, t)));
});
