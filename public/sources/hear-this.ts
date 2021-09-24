import fs from 'fs';
import path from 'path';
import { flatten } from 'lodash';
import { Project, Book, Chapter, getDirectories, sortInCanonicalOrder } from './util';
import ProjectSource from '../models/projectSource.model';

const PROJECT_TYPE = 'hearThis';

const DEFAULT_XML_NAME = 'info.xml';

class HearThis implements ProjectSource {
  get PROJECT_TYPE(): string {
    return PROJECT_TYPE;
  }

  getProjectStructure(rootDirectories: string[]): Project[] {
    try {
      return flatten(
        rootDirectories.map((directory: string) => {
          return getDirectories(directory).map((name: string) => this.makeProject(name, directory));
        })
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  makeProject(name: string, directory: string): Project {
    const project = new Project(PROJECT_TYPE);
    project.name = name;
    project.fullPath = path.join(directory, name);
    const bookNames = sortInCanonicalOrder(getDirectories(project.fullPath));
    project.books = bookNames
      .map((bookName: string) => this.makeBook(name, bookName, directory))
      .filter((book: Book) => book.chapters.length);
    return project;
  }

  makeBook(projectName: string, name: string, directory: string): Book {
    const book = new Book();
    book.name = name;
    const chapterNames = getDirectories(path.join(directory, projectName, name));

    const naturalSortChapterNames = chapterNames.sort(
      new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare
    );

    book.chapters = naturalSortChapterNames
      .map((chapterName: string) => this.makeChapter(projectName, name, chapterName, directory))
      .filter((chapter: Chapter) => chapter.audioFiles.length > 0);
    return book;
  }

  makeChapter(projectName: string, bookName: string, name: string, directory: string): Chapter {
    const chapter = new Chapter();
    chapter.name = parseInt(name).toString();
    const chapterFiles = fs.readdirSync(path.join(directory, projectName, bookName, name));
    chapter.audioFiles = chapterFiles
      .filter((file: string) => file !== DEFAULT_XML_NAME)
      .map((fileName: string) => path.join(directory, projectName, bookName, name, fileName));

    chapter.textXmlFile = chapterFiles.find((file: string) => file === DEFAULT_XML_NAME);
    if (chapter.textXmlFile)
      chapter.textXmlFile = path.join(directory, projectName, bookName, name, chapter.textXmlFile);
    chapter.fullPath = path.join(directory, projectName, bookName, name);
    return chapter;
  }
}

export default new HearThis();
