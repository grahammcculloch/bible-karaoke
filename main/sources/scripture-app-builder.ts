import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import _ from 'lodash';
import usfm from 'usfm-js';
import { SOURCE_TYPES } from '../../src/App/constants';
import { BKBook, BKChapter, BKProject, BKSegment } from '../models/projectFormat.model';
import ProjectSource from '../models/projectSource.model';
import { getDirectories } from './util';

interface SfmJson {
  chapters?: {
    [chapterNumber: number]: {
      verseObjects: {
        [verseNumber: number]: {
          type: string;
          text: string;
        };
      };
    };
  };
}

class ScriptureAppBuilder implements ProjectSource {
  readonly SOURCE_TYPE = SOURCE_TYPES.scriptureAppBuilder;

  getBKProjects(rootDirectories: string[]): BKProject[] {
    try {
      return _.flatten(
        rootDirectories
          .filter((directory: string) => fs.existsSync(directory))
          .map((directory: string) => {
            return getDirectories(directory)
              .map((name: string) => this.makeProject(name, directory))
              .flat()
              .filter((project: BKProject) => project.books.length);
          })
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  reloadProject(project: BKProject): BKProject {
    return project;
  }

  private makeProject(projectName: string, directory: string): BKProject | BKProject[] {
    const emptyProject: BKProject = {
      name: projectName,
      folderPath: path.join(directory, projectName),
      sourceType: this.SOURCE_TYPE,
      books: [],
    };
    const fileName = path.join(directory, projectName, projectName + '.appDef');
    let contents;
    try {
      contents = fs.readFileSync(fileName, 'utf8');
    } catch (error) {
      console.error(error);
      return emptyProject;
    }
    const dom = new JSDOM(contents, { contentType: 'text/xml' });
    const xmlDoc = dom.window.document;
    const booksIdElements = xmlDoc.querySelectorAll('books[id]');
    const collectionIds = _.map(booksIdElements, (element) => element.id ?? undefined).filter((e) => e != null);

    if (collectionIds.length === 1) {
      const project: BKProject = {
        name: projectName,
        folderPath: path.join(directory, projectName),
        sourceType: this.SOURCE_TYPE,
        books: this.makeBooks(xmlDoc, projectName, directory, collectionIds[0]),
      };
      return project;
    } else if (collectionIds.length > 1) {
      const projects: BKProject[] = collectionIds.map((id) => {
        const project: BKProject = {
          name: projectName + ' - ' + id,
          folderPath: path.join(directory, projectName),
          sourceType: this.SOURCE_TYPE,
          books: this.makeBooks(xmlDoc, projectName, directory, id),
        };
        return project;
      });
      return projects;
    } else {
      return emptyProject;
    }
  }

  private makeBooks(xmlDoc: Document, projectName: string, directory: string, collectionId: string): BKBook[] {
    const books: BKBook[] = [];
    const bookIdSelector = "books[id='" + collectionId + "'] > book[id]";
    const bookIds = _.map(xmlDoc.querySelectorAll(bookIdSelector), (n) => (n.id ? n.id : undefined)).filter(
      (id) => id != null && id !== ''
    );
    for (const bookId of bookIds) {
      const bookNameSelector = "book[id='" + bookId + "'] > name";
      const bookFileNameSelector = "book[id='" + bookId + "'] > filename";

      const bookName = xmlDoc.querySelector(bookNameSelector)?.textContent;
      const bookFileName = xmlDoc.querySelector(bookFileNameSelector)?.textContent;
      if (!bookFileName || !bookName || !bookId) {
        return [];
      }
      // we only work with .sfm files at the moment, so cancel if is .usx or other
      if (!bookFileName.toLowerCase().endsWith('.sfm')) {
        return [];
      }
      const sfmFileName = path.join(directory, projectName, projectName + '_data', 'books', collectionId, bookFileName);

      let sfmJson: SfmJson = {};
      try {
        sfmJson = usfm.toJSON(fs.readFileSync(sfmFileName, 'utf8'));
      } catch (error) {
        console.error(error);
      }
      if (!sfmJson) {
        continue;
      }

      const book: BKBook = {
        name: bookName,
        chapters: this.makeChapters(bookId, sfmJson, xmlDoc, projectName, directory),
      };

      if (book.chapters.length > 0) {
        books.push(book);
      }
    }
    return books;
  }

  private makeChapters(
    bookId: string,
    sfmJson: SfmJson,
    xmlDoc: Document,
    projectName: string,
    directory: string
  ): BKChapter[] {
    const chapters: BKChapter[] = [];

    // there are two different schemas
    let isPageSchema = true;

    let chapterNumbers = _.map(
      xmlDoc.querySelectorAll("book[id='" + bookId + "'] > page[num] > audio > timing-filename"),
      (n) => n.parentElement?.parentElement?.attributes.getNamedItem('num')?.value ?? undefined
    ).filter((cn) => cn != null && cn !== '');
    if (chapterNumbers.length === 0) {
      // attempt to use old schema
      isPageSchema = false;
      chapterNumbers = _.map(
        xmlDoc.querySelectorAll("book[id='" + bookId + "'] > audio[chapter] > timing-filename"),
        (n) => n.parentElement?.attributes.getNamedItem('chapter')?.value ?? undefined
      ).filter((cn) => cn != null && cn !== '');
    }
    if (chapterNumbers.length === 0) {
      return [];
    }

    for (const chapterNumber of chapterNumbers) {
      const fileSelector = isPageSchema
        ? "book[id='" + bookId + "'] > page[num='" + chapterNumber + "'] > audio > filename"
        : "book[id='" + bookId + "'] > audio[chapter='" + chapterNumber + "'] > filename";

      const timingFileSelector = isPageSchema
        ? "book[id='" + bookId + "'] > page[num='" + chapterNumber + "'] > audio > timing-filename"
        : "book[id='" + bookId + "'] > audio[chapter='" + chapterNumber + "'] > timing-filename";

      const audioFileName = xmlDoc.querySelector(fileSelector)?.textContent;
      const audioFileLength = xmlDoc.querySelector(fileSelector)?.getAttribute('len');
      const timingFileName = xmlDoc.querySelector(timingFileSelector)?.textContent;
      // cancel if anything can't be found
      if (!audioFileName || !audioFileLength || !timingFileName || !chapterNumber) {
        return [];
      }

      const audioFile = this.calculateAudioFile(audioFileName, directory, projectName);
      if (!audioFile) {
        return [];
      }

      const segments: BKSegment[] = this.makeSegments(sfmJson, +chapterNumber, timingFileName, projectName, directory);
      if (segments.length > 0) {
        chapters.push({
          name: chapterNumber,
          audio: { files: [{ filename: audioFile, length: parseInt(audioFileLength) }] },
          segments,
        });
      }
    }

    return chapters;
  }

  private makeSegments(
    sfmJson: SfmJson,
    chapterNumber: number,
    timingFileName: string,
    projectName: string,
    directory: string
  ): BKSegment[] {
    const segments: BKSegment[] = [];

    const timingFileFullName = path.join(directory, projectName, projectName + '_data', 'timings', timingFileName);

    let timingFileContent;

    try {
      timingFileContent = fs.readFileSync(timingFileFullName, 'utf8');
    } catch (error) {
      console.error(error);
      return [];
    }

    // Regex to match the timing lines in the timing file
    // tab separated list with possible decimals
    // representing respectively: start time, end time, verse number
    // e.g. 124.12  123  1
    const timingPattern = /(\d+\.?\d*)\t(\d+\.?\d*)\t(\d+)/gs;

    let timingMatches;
    const timingOutput = [];
    while ((timingMatches = timingPattern.exec(timingFileContent))) {
      //this is where we get the start time, duration, and verse number from the timing file
      timingOutput.push({
        startTime: parseFloat(timingMatches[1]) * 1000,
        endTime: parseFloat(timingMatches[2]) * 1000,
        verse: timingMatches[3],
      });
    }

    const chapterJson = sfmJson.chapters ? sfmJson.chapters[chapterNumber] : undefined;
    if (!chapterJson) {
      return [];
    }
    for (const verse in chapterJson) {
      const startTime = _.find(timingOutput, { verse })?.startTime;
      const endTime = _.findLast(timingOutput, { verse })?.endTime;
      const text = chapterJson[verse].verseObjects[0].text;
      // skip segment if missing timing info
      if (startTime == null || endTime == null || !text) {
        continue;
      }
      segments.push({
        segmentId: parseInt(verse),
        text,
        verse,
        startTime,
        length: endTime - startTime,
        isHeading: false,
      });
    }
    return segments;
  }

  private calculateAudioFile(oldFile: string, directory: string, projectName: string): string | undefined {
    if (fs.existsSync(oldFile)) {
      return oldFile;
    }
    const split = oldFile.split(path.sep);
    const dirList = fs.readdirSync(path.join(directory, projectName));
    dirList.splice(dirList.indexOf(projectName + '.appDef'), 1);
    dirList.splice(dirList.indexOf(projectName + '_data'), 1);
    for (const dirName in dirList) {
      if (split.includes(dirName)) {
        const audioFile = path.join(directory, projectName, ...split.slice(split.lastIndexOf(dirName)));
        if (fs.existsSync(audioFile)) {
          return audioFile;
        }
      }
    }
    if (dirList.length === 1) {
      const audioFile = path.join(directory, projectName, dirList[0], split[split.length - 1]);
      if (fs.existsSync(audioFile)) {
        return audioFile;
      }
    }
    return undefined;
  }
}

export default new ScriptureAppBuilder();
