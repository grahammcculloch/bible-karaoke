import test, { ExecutionContext } from 'ava';
import { map } from 'lodash';
import { scenarios } from './scenarios';
import { bkImport } from '../hearThisImport';
import { BKProject } from '../../../models/projectFormat.model';
import { ConvertProject } from '../../../models/convertFormat.model';

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
