import fs from 'fs';
import path from 'path';

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory();
}

export function getDirectories(source: string): string[] {
  return fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));
}

export function sortInCanonicalOrder(bookNames: string[], key = 'bookName'): string[] {
  // OT list according to https://en.wikipedia.org/wiki/Biblical_canon#/media/File:Development_of_the_Old_Testament.svg
  // USFM list here: https://ubsicap.github.io/usfm/identification/books.html

  const sortedBooks: string[] = [];
  bookNamesAndIds.forEach((book) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const index = bookNames.indexOf(book[key]);
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

// splits a string at the phraseEndChars
export function createPhraseArray(text: string, phraseEndCharsString: string): string[] {
  const phraseEndChars = createPhraseChars(phraseEndCharsString);

  let result: string[] = [];

  if (phraseEndChars.length < 1) {
    return [text];
  }

  for (const [index, char] of phraseEndChars.entries()) {
    if (index === phraseEndChars.length - 1) {
      result = text.split(char);
    } else {
      text = text.replaceAll(char, phraseEndChars[phraseEndChars.length - 1]);
    }
  }
  return result.map((p: string) => p.trim()).filter((p) => p);
}

export function createPhraseChars(phraseCharString: string): string[] {
  const fixedSpaces = phraseCharString.replaceAll(' ', '').replaceAll('\\s', ' ');
  return stringFromUnicode(fixedSpaces).split('');
}

export function stringFromUnicode(unicodeString: string): string {
  const unicodeRegex = /\\u[\dA-Fa-f]{4}/g;
  return unicodeString.replace(unicodeRegex, function (match) {
    return String.fromCharCode(parseInt(match.replaceAll('\\u', ''), 16));
  });
}

// convert SAB phrase lettering system to number equivalent:
// a = 0, z = 25, aa = 26 etc.
export function lettersToNumber(letterString: string): number {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let number = 0;
  let exponent = letterString.length - 1;
  for (let i = 0; i < letterString.length; i++) {
    number += (letters.indexOf(letterString[i].toLowerCase()) + 1) * letters.length ** exponent;
    exponent--;
  }
  return number - 1;
}

interface VerseJson {
  verseObjects: VerseObject[];
}
interface VerseObject {
  type: string;
  text: string;
}

export function getVerseText(verse: VerseJson): string {
  return verse.verseObjects
    .reduce((arr: string[], verseObject: VerseObject) => {
      if (verseObject.type === 'text') {
        arr.push(verseObject.text);
      }
      return arr;
    }, [])
    .join('')
    .trim();
}

export const bookNamesAndIds = [
  { bookName: 'Genesis', SAB: 'GEN', FCBH: 'Gen' },
  { bookName: 'Exodus', SAB: 'EXO', FCBH: 'Exod' },
  { bookName: 'Leviticus', SAB: 'LEV', FCBH: 'Lev' },
  { bookName: 'Numbers', SAB: 'NUM', FCBH: 'Num' },
  { bookName: 'Deuteronomy', SAB: 'DEU', FCBH: 'Deut' },
  { bookName: 'Joshua', SAB: 'JOS', FCBH: 'Josh' },
  { bookName: 'Judges', SAB: 'JDG', FCBH: 'Judg' },
  { bookName: 'Ruth', SAB: 'RUT', FCBH: 'Ruth' },
  { bookName: '1 Samuel', SAB: '1SA', FCBH: '1Sam' },
  { bookName: '2 Samuel', SAB: '2SA', FCBH: '2Sam' },
  { bookName: '1 Kings', SAB: '1KI', FCBH: '1Kgs' },
  { bookName: '2 Kings', SAB: '2KI', FCBH: '2Kgs' },
  { bookName: '3 Kings', SAB: '3KI', FCBH: '3Kgs' },
  { bookName: '4 Kings', SAB: '4KI', FCBH: '4Kgs' },
  { bookName: '1 Chronicles', SAB: '1CH', FCBH: '1Chr' },
  { bookName: '2 Chronicles', SAB: '2CH', FCBH: '2Chr' },
  { bookName: 'Ezra', SAB: 'EZR', FCBH: 'Ezra' },
  { bookName: 'Nehemiah', SAB: 'NEH', FCBH: 'Neh' },
  { bookName: '1 Esdras', SAB: '1ES' },
  { bookName: '2 Esdras', SAB: '2ES' },
  { bookName: 'Tobit', SAB: 'TOB' },
  { bookName: 'Judith', SAB: 'JDT' },
  { bookName: 'Esther', SAB: 'EST', FCBH: 'Esth' },
  { bookName: '1 Maccabees', SAB: '1MA' },
  { bookName: '2 Maccabees', SAB: '2MA' },
  { bookName: '3 Maccabees', SAB: '3MA' },
  { bookName: '4 Maccabees', SAB: '4MA' },
  { bookName: 'Job', SAB: 'JOB', FCBH: 'Job' },
  { bookName: 'Psalms', SAB: 'PSA', FCBH: 'Ps' },
  { bookName: 'Proverbs', SAB: 'PRO', FCBH: 'Prov' },
  { bookName: 'Ecclesiastes', SAB: 'ECC', FCBH: 'Eccl' },
  { bookName: 'Song of Solomon', SAB: 'SNG', FCBH: 'Song' },
  { bookName: 'Wisdom', SAB: 'WIS' },
  { bookName: 'Sirach', SAB: 'SIR' },
  { bookName: 'Isaiah', SAB: 'ISA', FCBH: 'Isa' },
  { bookName: 'Jeremiah', SAB: 'JER', FCBH: 'Jer' },
  { bookName: 'Lamentations', SAB: 'LAM', FCBH: 'Lam' },
  { bookName: 'Baruch', SAB: 'BAR' },
  { bookName: 'Ezekiel', SAB: 'EZK', FCBH: 'Ezek' },
  { bookName: 'Daniel', SAB: 'DAN', FCBH: 'Dan' },
  { bookName: 'Hosea', SAB: 'HOS', FCBH: 'Hos' },
  { bookName: 'Joel', SAB: 'JOL', FCBH: 'Joel' },
  { bookName: 'Amos', SAB: 'AMO', FCBH: 'Amos' },
  { bookName: 'Obadiah', SAB: 'OBA', FCBH: 'Obad' },
  { bookName: 'Jonah', SAB: 'JON', FCBH: 'Jonah' },
  { bookName: 'Micah', SAB: 'MIC', FCBH: 'Mic' },
  { bookName: 'Nahum', SAB: 'NAM', FCBH: 'Nah' },
  { bookName: 'Habakkuk', SAB: 'HAB', FCBH: 'Hab' },
  { bookName: 'Zephaniah', SAB: 'ZEP', FCBH: 'Zeph' },
  { bookName: 'Haggai', SAB: 'HAG', FCBH: 'Hag' },
  { bookName: 'Zechariah', SAB: 'ZEC', FCBH: 'Zech' },
  { bookName: 'Malachi', SAB: 'MAL', FCBH: 'Mal' },
  { bookName: 'Matthew', SAB: 'MAT', FCBH: 'Matt' },
  { bookName: 'Mark', SAB: 'MRK', FCBH: 'Mark' },
  { bookName: 'Luke', SAB: 'LUK', FCBH: 'Luke' },
  { bookName: 'John', SAB: 'JHN', FCBH: 'John' },
  { bookName: 'Acts', SAB: 'ACT', FCBH: 'Acts' },
  { bookName: 'Romans', SAB: 'ROM', FCBH: 'Rom' },
  { bookName: '1 Corinthians', SAB: '1CO', FCBH: '1Cor' },
  { bookName: '2 Corinthians', SAB: '2CO', FCBH: '2Cor' },
  { bookName: 'Galatians', SAB: 'GAL', FCBH: 'Gal' },
  { bookName: 'Ephesians', SAB: 'EPH', FCBH: 'Eph' },
  { bookName: 'Philippians', SAB: 'PHP', FCBH: 'Phil' },
  { bookName: 'Colossians', SAB: 'COL', FCBH: 'Col' },
  { bookName: '1 Thessalonians', SAB: '1TH', FCBH: '1Thess' },
  { bookName: '2 Thessalonians', SAB: '2TH', FCBH: '2Thess' },
  { bookName: '1 Timothy', SAB: '1TI', FCBH: '1Tim' },
  { bookName: '2 Timothy', SAB: '2TI', FCBH: '2Tim' },
  { bookName: 'Titus', SAB: 'TIT', FCBH: 'Titus' },
  { bookName: 'Philemon', SAB: 'PHM', FCBH: 'Phlm' },
  { bookName: 'Hebrews', SAB: 'HEB', FCBH: 'Heb' },
  { bookName: 'James', SAB: 'JAS', FCBH: 'Jas' },
  { bookName: '1 Peter', SAB: '1PE', FCBH: '1Pet' },
  { bookName: '2 Peter', SAB: '2PE', FCBH: '2Pet' },
  { bookName: '1 John', SAB: '1JN', FCBH: '1John' },
  { bookName: '2 John', SAB: '2JN', FCBH: '2John' },
  { bookName: '3 John', SAB: '3JN', FCBH: '3John' },
  { bookName: 'Jude', SAB: 'JUD', FCBH: 'Jude' },
  { bookName: 'Revelation', SAB: 'REV', FCBH: 'Rev' },
  { bookName: 'Apocalypse' },
];
