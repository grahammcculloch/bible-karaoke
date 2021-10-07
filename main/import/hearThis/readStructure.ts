import fs from 'fs';
import path from 'path';
import { flatten } from 'lodash';
import { getDirectories } from '../import-util';
import { ConvertProject, ConvertBook } from '../../models/convertFormat.model';

export const PROJECT_TYPE = 'hearThis';
const DEFAULT_XML_NAME = 'info.xml';

export function getProjectStructure(rootDirectories: string[] = []): ConvertProject[] {
  return flatten(
    rootDirectories.map((directory) => getDirectories(directory).map((name: string) => makeProject(name, directory)))
  );
}

function makeProject(name: string, directory: string): ConvertProject {
  const fullPath = path.join(directory, name);
  const project: ConvertProject = { name, fullPath, books: [] };
  const bookNames = getDirectories(fullPath);
  project.books = bookNames
    .map((bookName: string) => makeBook(name, bookName, directory))
    .filter((book: ConvertBook) => book.chapters.length);
  return project;
}

function makeBook(projectName: string, bookName: string, directory: string): ConvertBook {
  const book: ConvertBook = { name: bookName, chapters: [] };
  const chapterNames = getDirectories(path.join(directory, projectName, bookName));

  const naturalSortChapterNames = chapterNames.sort(
    new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare
  );

  naturalSortChapterNames.forEach((chapterName: string) => {
    const chapterFiles = fs.readdirSync(path.join(directory, projectName, bookName, chapterName));
    const audioFiles = chapterFiles.filter((file: string) => file !== DEFAULT_XML_NAME);
    if (audioFiles.length > 0) {
      book.chapters.push({ name: chapterName });
    }
  });
  return book;
}
