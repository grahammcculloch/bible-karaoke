import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { flatten } from 'lodash';
import winston from 'winston';
import { xml2json } from 'xml-js';
import { fileFilters } from '../../src/App/constants';
import { BKBook, BKChapter, BKProject } from '../models/projectFormat.model';
import ProjectSource from '../models/projectSource.model';
import { paths } from '../path-constants';
import { getDirectories, isValidAudioFile, sortInCanonicalOrder } from './util';

const SOURCE_TYPE = 'hearThis';

export const DEFAULT_HEARTHIS_XML_FILE = 'info.xml';

interface ScriptLine {
  LineNumber: { _text: string };
  Text: { _text: string };
  RecordingTime: { _text: string };
  Verse: { _text: string };
  Heading: { _text: string };
  HeadingType?: { _text: string };
}

class HearThis implements ProjectSource {
  get SOURCE_TYPE(): string {
    return SOURCE_TYPE;
  }

  getBKProjects(rootDirectories: string[]): BKProject[] {
    try {
      return flatten(
        rootDirectories
          .filter((directory: string) => fs.existsSync(directory))
          .map((directory: string) => {
            return getDirectories(directory)
              .map((name: string) => this.makeProject(name, directory))
              .filter((project: BKProject) => project.books.length);
          })
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  reloadProject(project: BKProject): BKProject {
    const directory = path.parse(project.folderPath).dir;
    const books = project.books.map((book: BKBook): BKBook => {
      const chapters = book.chapters.map(
        (chapter: BKChapter): BKChapter => this.makeChapter(project.name, book.name, chapter.name, directory, true)
      );
      return { name: book.name, chapters };
    });
    return { name: project.name, folderPath: project.folderPath, sourceType: project.sourceType, books };
  }

  private makeProject(projectName: string, directory: string): BKProject {
    const project: BKProject = {
      name: projectName,
      folderPath: path.join(directory, projectName),
      sourceType: this.SOURCE_TYPE,
      books: [],
    };
    const bookNames = sortInCanonicalOrder(getDirectories(project.folderPath));
    const projectBooks = bookNames
      .map((bookName: string) => this.makeBook(projectName, bookName, directory))
      .filter((book: BKBook) => book.chapters.length);
    for (const book of projectBooks) {
      project.books.push(book);
    }
    return project;
  }

  private makeBook(projectName: string, bookName: string, directory: string): BKBook {
    const book: BKBook = {
      name: bookName,
      chapters: [],
    };
    const chapterNames = getDirectories(path.join(directory, projectName, bookName));

    const naturalSortChapterNames = chapterNames.sort(
      new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare
    );

    const bookChapters = naturalSortChapterNames
      .map((chapterName: string) => this.makeChapter(projectName, bookName, chapterName, directory))
      .filter((chapter: BKChapter) => chapter.audio.files.length);
    for (const chapter of bookChapters) {
      book.chapters.push(chapter);
    }
    return book;
  }

  private makeChapter(
    projectName: string,
    bookName: string,
    chapterName: string,
    directory: string,
    calculateAudioDuration = false
  ): BKChapter {
    const chapter: BKChapter = {
      name: chapterName,
      audio: {
        files: [],
        length: 0,
      },
      segments: [],
    };
    const sourceChapterDir = path.join(directory, projectName, bookName, chapterName);
    const chapterFiles = fs.readdirSync(sourceChapterDir, 'utf8');
    const audioFiles = chapterFiles.filter((file: string) => isValidAudioFile(file, fileFilters.audio[0].extensions));
    const infoXmlPath = path.join(sourceChapterDir, DEFAULT_HEARTHIS_XML_FILE);

    // skip chapters that have no xml file or no audio files
    if (!chapterFiles.includes(DEFAULT_HEARTHIS_XML_FILE) || audioFiles.length === 0) {
      return chapter;
    }

    const infoXmlFileContents = fs.readFileSync(infoXmlPath, { encoding: 'utf-8' });
    const chapterInfo = JSON.parse(xml2json(infoXmlFileContents, { compact: true }));
    if (!Array.isArray(chapterInfo.ChapterInfo.Recordings.ScriptLine)) {
      chapterInfo.ChapterInfo.Recordings.ScriptLine = [chapterInfo.ChapterInfo.Recordings.ScriptLine];
    }

    let chapterAudioLength = 0;
    for (const scriptLine of chapterInfo.ChapterInfo.Recordings.ScriptLine as ScriptLine[]) {
      // Ignore undefined or empty scriptLines
      if (!scriptLine) {
        continue;
      }
      // Fix #20 : ignore Chapter Headings
      if (scriptLine.HeadingType?._text === 'c' && scriptLine.Verse._text === '0') {
        continue;
      }

      const segmentId = parseInt(scriptLine.LineNumber._text, 10);
      const audioFileName = `${segmentId - 1}.wav`;
      const audioPath: string = path.join(sourceChapterDir, audioFileName);
      // ignore scriptLines with no corresponding audio file
      if (!audioFiles.includes(audioFileName)) {
        continue;
      }

      let duration = 0;
      if (calculateAudioDuration) {
        duration = getAudioDurationInMilliseconds(audioPath);
      }

      chapter.audio.files.push({ filename: audioPath, length: duration });

      chapter.segments.push({
        segmentId,
        text: scriptLine.Text._text,
        verse: scriptLine.Verse._text,
        startTime: chapterAudioLength,
        length: duration,
        isHeading: scriptLine.Heading._text === 'true',
      });
      if (calculateAudioDuration) {
        chapterAudioLength += duration;
        chapter.audio.length = chapterAudioLength;
      }
    }
    return chapter;
  }
}

export default new HearThis();

// Adapted from https://github.com/caffco/get-audio-duration:
function getAudioDurationInMilliseconds(filePath: string): number {
  const ffprobe = spawnSync(paths.ffprobe, ['-v', 'error', '-show_format', filePath], { stdio: 'pipe' });

  const stderr = ffprobe.stderr.toString();
  if (stderr !== '') {
    winston.error(stderr);
    throw new Error(stderr);
  }

  const matched = (ffprobe.stdout ?? '').toString().match(/duration="?(\d*\.\d*)"?/);
  if (matched && matched[1]) {
    return parseFloat(matched[1]) * 1000;
  } else {
    const message = `No duration found! (ffprobe : "${ffprobe.stdout}")`;
    winston.error(message);
    throw new Error(message);
  }
}
