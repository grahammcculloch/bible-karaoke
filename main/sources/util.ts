import fs from 'fs';
import path from 'path';

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
    'Apocalypse',
  ];
  const sortedBooks: string[] = [];
  CANONICAL_BOOK_ORDER.forEach((book) => {
    const index = bookNames.indexOf(book);
    if (index >= 0) {
      // move bookName from bookNames into sortedBooks
      sortedBooks.push(...bookNames.splice(index, 1));
    }
  });
  // append unrecognised books to the end
  return sortedBooks.concat(bookNames);
}

export function isValidAudioFile(file: string, audioExtensions: string[]): boolean {
  return audioExtensions.some((ext: string) => file.toLowerCase().endsWith(`.${ext}`));
}
