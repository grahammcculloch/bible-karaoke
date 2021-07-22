import fs from 'fs';
import path from 'path';
import xml2json from 'xml-js';

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory();
}

export function getDirectories(source: string): string[] {
  return fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));
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
    let verses = jsonInfo.ChapterInfo.Recordings.ScriptLine.slice(0, 4).map((line: any): string => {
      // Fix #20 : ignore Chapter Headings
      if (line.HeadingType && line.HeadingType._text == 'c') {
        return '';
      }
      let text = line.Text._text;
      if (line.Heading._text === 'true') {
        text = `<strong>${text}</strong>`;
      }
      return text;
    });
    // use .filter() to remove any undefined elements
    verses = verses.filter((v: string) => v);
    // only return 3
    if (verses.length > 3) verses.pop();
    return verses;
  } catch (err) {
    console.error('Failed to get sample verses', err);
    return ['Failed to get sample verses'];
  }
}
