import fs from 'fs';
import path from 'path';
import xml2json from 'xml-js';
import { ScriptLine } from '../cli/lib/import/hearThis/hearThisImport';

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory();
}

export function getDirectories(source: string): string[] {
  return fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));
}

export function sortInCanonicalOrder(bookNames: string[]): string[] {
  // OT list according to https://en.wikipedia.org/wiki/Biblical_canon#/media/File:Development_of_the_Old_Testament.svg
  // USFM list here: https://ubsicap.github.io/usfm/identification/books.html
  const CANONICAL_BOOK_ORDER = [
    'Genesis',
    'Exodus',
    'Leviticus',
    'Numbers',
    'Deuteronomy',
    'Joshua',
    'Judges',
    'Ruth',
    '1 Samuel',
    '2 Samuel',
    '1 Kings',
    '2 Kings',
    '3 Kings',
    '4 Kings',
    'Ezra',
    'Nehemiah',
    '1 Esdras',
    '2 Esdras',
    'Tobit',
    'Judith',
    'Esther',
    '1 Maccabees',
    '2 Maccabees',
    '3 Maccabees',
    '4 Maccabees',
    'Job',
    'Psalms',
    'Proverbs',
    'Ecclesiastes',
    'Song of Songs',
    'Wisdom',
    'Sirach',
    'Isaiah',
    'Jeremiah',
    'Lamentations',
    'Baruch',
    'Ezekiel',
    'Daniel',
    'Hosea',
    'Joel',
    'Amos',
    'Obadiah',
    'Jonah',
    'Micah',
    'Nahum',
    'Habakkuk',
    'Zephaniah',
    'Haggai',
    'Zechariah',
    'Malachi',
    'Matthew',
    'Mark',
    'Luke',
    'John',
    'Acts',
    'Romans',
    '1 Corinthians',
    '2 Corinthians',
    'Galatians',
    'Ephesians',
    'Philippians',
    'Colossians',
    '1 Thessalonians',
    '2 Thessalonians',
    '1 Timothy',
    '2 Timothy',
    'Titus',
    'Philemon',
    'Hebrews',
    'James',
    '1 Peter',
    '2 Peter',
    '1 John',
    '2 John',
    '3 John',
    'Jude',
    'Revelation',
    'Apocalypse'
  ];
  const sortedBooks: string[] = [];
  CANONICAL_BOOK_ORDER.forEach(book => {
    const index = bookNames.indexOf(book);
    if (index >= 0) {
      // move bookName from bookNames into sortedBooks
      sortedBooks.push(...bookNames.splice(index, 1));
    }
  });
  // append unrecognised books to the end
  return sortedBooks.concat(bookNames);
}


export class Project {
  projectType: string;
  name: string;
  fullPath: string;
  books: Book[];

  constructor(projectType: string) {
    this.projectType = projectType;
    this.name = '';
    this.fullPath = '';
    this.books = [];
  }
}

export class Book {
  name: string;
  chapters: Chapter[];

  constructor() {
    this.name = '';
    this.chapters = [];
  }
}

export class Chapter {
  name: string;
  fullPath: string;
  audioFiles: string[];
  textXmlFile?: string;

  constructor() {
    this.name = '';
    this.fullPath = '';
    this.audioFiles = [];
    this.textXmlFile = '';
  }
}

export function getSampleVerses(sourceDirectory: string): string[] {
  try {
    const info = fs.readFileSync(path.join(sourceDirectory, 'info.xml'), 'utf8');
    const jsonInfo = JSON.parse(xml2json.xml2json(info, { compact: true }));
    let scriptLines = jsonInfo.ChapterInfo.Recordings.ScriptLine;
    // make sure ScriptLine is an array
    if (!Array.isArray(scriptLines)) {
      scriptLines = [scriptLines];
    }
    let verses = (scriptLines as ScriptLine[]).slice(0, 4).map((line: ScriptLine): string => {
      // Fix #20 : ignore Chapter Headings
      if (line.HeadingType?._text === 'c' && line.Verse._text === '0') {
        return '';
      }
      let text = line.Text._text;
      if (line.Heading._text === 'true') {
        text = `<strong>${text}</strong>`;
      }
      return text;
    });
    // remove any undefined or empty elements
    verses = verses.filter((v: string) => v);
    // only return 3
    if (verses.length > 3) verses.pop();
    return verses;
  } catch (err) {
    console.error('Failed to get sample verses', err);
    return ['Failed to get sample verses'];
  }
}
