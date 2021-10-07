import path from 'path';

const exampleHearThisProjectName = 'ExampleHearThisProject';

export const testPaths = {
  exampleHearThisProjectName,
  exampleHearThisProjectPath: path.resolve(__dirname, 'fixtures', exampleHearThisProjectName),
  fixtures: path.resolve(__dirname, 'fixtures'),
  frameImages: path.resolve(__dirname, 'images'),
};
