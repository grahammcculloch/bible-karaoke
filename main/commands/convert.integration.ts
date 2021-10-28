import fs from 'fs';
import path from 'path';
import test from 'ava';
import tmp from 'tmp-promise';
import { checkOverwrite } from './convert';

test('should use the same filename (overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  const { path: outputFilePath, cleanup } = await tmp.file();
  const overwriteOutputFiles = true;
  t.true(fs.existsSync(outputFilePath), 'setup');

  const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

  t.is(filePath, outputFilePath);
  t.false(fs.existsSync(outputFilePath));
  cleanup();
});

test('should use a different filename (no overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  const { path: outputFilePath, cleanup } = await tmp.file();
  const overwriteOutputFiles = false;
  t.notRegex(outputFilePath, / \(1\)/, 'setup');

  const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

  t.not(filePath, outputFilePath);
  // filename should contain ' (1)'
  t.regex(filePath, / \(1\)/);
  cleanup();
});

test('should use a different incremented filename (no overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  await tmp.withDir(
    async ({ path: directory }) => {
      const outputFilePath = path.join(directory, 'project_book_1.tmp');
      // create files
      fs.closeSync(fs.openSync(outputFilePath, 'w'));
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1 (1).tmp'), 'w'));
      const overwriteOutputFiles = false;
      t.notRegex(outputFilePath, / \(1\)/, 'setup');

      const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

      t.not(filePath, outputFilePath);
      // filename should contain ' (2)'
      t.regex(filePath, / \(2\)/);
    },
    { unsafeCleanup: true }
  );
});

test('should use a different incremented filename even with a copy gap (no overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  await tmp.withDir(
    async ({ path: directory }) => {
      const outputFilePath = path.join(directory, 'project_book_1.tmp');
      // create files
      fs.closeSync(fs.openSync(outputFilePath, 'w'));
      // copy gap since 'project_book_1 (1).tmp' doesn't exist
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1 (2).tmp'), 'w'));
      const overwriteOutputFiles = false;
      t.notRegex(outputFilePath, / \(1\)/, 'setup');

      const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

      t.not(filePath, outputFilePath);
      // filename should contain ' (3)'
      t.regex(filePath, / \(3\)/);
    },
    { unsafeCleanup: true }
  );
});

test('should not include files that are similar but unrelated copies (no overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  await tmp.withDir(
    async ({ path: directory }) => {
      const outputFilePath = path.join(directory, 'project_book_1.tmp');
      // create files
      fs.closeSync(fs.openSync(outputFilePath, 'w'));
      // neither of the next 2 files should be included
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1-(1).tmp'), 'w'));
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1NotACopy (1).tmp'), 'w'));
      const overwriteOutputFiles = false;
      t.notRegex(outputFilePath, / \(1\)/, 'setup');

      const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

      t.not(filePath, outputFilePath);
      // filename should contain ' (1)'
      t.regex(filePath, / \(1\)/);
    },
    { unsafeCleanup: true }
  );
});

test('should not use an alphanumeric sort (no overwrite)', async (t) => {
  tmp.setGracefulCleanup();
  await tmp.withDir(
    async ({ path: directory }) => {
      const outputFilePath = path.join(directory, 'project_book_1.tmp');
      // create files
      fs.closeSync(fs.openSync(outputFilePath, 'w'));
      // neither of the next 2 files should be included
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1 (9).tmp'), 'w'));
      fs.closeSync(fs.openSync(path.join(directory, 'project_book_1 (10).tmp'), 'w'));
      const overwriteOutputFiles = false;
      t.notRegex(outputFilePath, / \(11\)/, 'setup');

      const filePath = checkOverwrite(outputFilePath, overwriteOutputFiles);

      t.not(filePath, outputFilePath);
      // filename should contain ' (11)'
      t.regex(filePath, / \(11\)/);
    },
    { unsafeCleanup: true }
  );
});
