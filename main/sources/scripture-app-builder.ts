import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import _ from 'lodash';
import usfm from 'usfm-js';
import { SOURCE_TYPES } from '../../src/App/constants';
import { BKBook, BKChapter, BKProject, BKSegment, ExtraTiming } from '../models/projectFormat.model';
import ProjectSource from '../models/projectSource.model';
import { createPhraseArray, getDirectories, getVerseText, lettersToNumber } from './util';

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
    let reloadedProject = this.makeProject(path.parse(project.folderPath).base, path.parse(project.folderPath).dir);
    if (Array.isArray(reloadedProject)) {
      reloadedProject = _.find(reloadedProject, { name: project.name }) ?? reloadedProject[0];
    }
    // filter the full reloadedProject based on the input project that contains only the chapters the user has selected
    return {
      name: reloadedProject.name,
      folderPath: reloadedProject.folderPath,
      sourceType: reloadedProject.sourceType,
      books: reloadedProject.books.reduce((arr: BKBook[], book: BKBook) => {
        if (_.find(project.books, { name: book.name })) {
          const filteredChapters = book.chapters.reduce((arr: BKChapter[], chapter: BKChapter) => {
            if (_.find(_.find(project.books, { name: book.name })?.chapters, { name: chapter.name })) {
              arr.push(chapter);
            }
            return arr;
          }, []);
          arr.push({
            name: book.name,
            chapters: filteredChapters,
          });
        }
        return arr;
      }, []),
    };
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
    const phraseEndChars =
      xmlDoc.querySelector('feature[name=audio-phrase-end-chars]')?.attributes.getNamedItem('value')?.value ?? '';

    const booksIdElements = xmlDoc.querySelectorAll('books[id]');
    const collectionIds = _.map(booksIdElements, (element) => element.id ?? undefined).filter((e) => e != null);

    // return one project for each collectionId if possible
    if (collectionIds.length === 1) {
      const project: BKProject = {
        name: projectName,
        folderPath: path.join(directory, projectName),
        sourceType: this.SOURCE_TYPE,
        books: this.makeBooks(xmlDoc, projectName, directory, phraseEndChars, collectionIds[0]),
      };
      return project;
    } else if (collectionIds.length > 1) {
      const projects: BKProject[] = collectionIds.map((id) => {
        const project: BKProject = {
          name: projectName + ' - ' + id,
          folderPath: path.join(directory, projectName),
          sourceType: this.SOURCE_TYPE,
          books: this.makeBooks(xmlDoc, projectName, directory, phraseEndChars, id),
        };
        return project;
      });
      return projects;
    } else {
      return emptyProject;
    }
  }

  private makeBooks(
    xmlDoc: Document,
    projectName: string,
    directory: string,
    phraseEndChars: string,
    collectionId: string
  ): BKBook[] {
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
        chapters: this.makeChapters(bookId, sfmJson, xmlDoc, projectName, directory, phraseEndChars),
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
    directory: string,
    phraseEndChars: string
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
      // Skip if anything is not found.
      if (!audioFileName || !audioFileLength || !timingFileName || !chapterNumber) {
        continue;
      }

      const audioFile = this.getAudioFilePath(audioFileName, directory, projectName);
      if (!audioFile) {
        continue;
      }

      const segments: BKSegment[] = this.makeSegments(
        sfmJson,
        +chapterNumber,
        phraseEndChars,
        timingFileName,
        projectName,
        directory
      );
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
    phraseEndChars: string,
    timingFileName: string,
    projectName: string,
    directory: string
  ): BKSegment[] {
    const segments: BKSegment[] = [];

    // timingFileName is usually a file name in the timings folder, but can possibly be a full file path
    let timingFileFullName = path.join(directory, projectName, projectName + '_data', 'timings', timingFileName);
    if (!fs.existsSync(timingFileFullName)) {
      timingFileFullName = timingFileName;
    }

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

    // verse number can be a number representing a verse, a number followed by a letter representing a phrase (separated by phraseEndChars), blank representing the next phrase in the current verse, or can be followed by an underscore and number representing that numbered word in the phrase or verse
    // e.g. 1.2 2.1 1b_3 (meaning 3rd word of second phrase in first verse)
    // the verse number can also be two verses connected by a dash as a bridge verse
    // e.g. 12-13 (verse 12 to verse 13)
    // https://software.sil.org/downloads/r/scriptureappbuilder/Scripture-App-Builder-06-Using-Audacity-for-Audio-Text-Synchronization.pdf
    const timingPattern = /(\d+\.?\d*)\t(\d+\.?\d*)\t([\w|-]*)/gs;

    let timingMatches;
    const timingData = [];
    while ((timingMatches = timingPattern.exec(timingFileContent))) {
      //this is where we get the start time, duration, and verse number from the timing file
      timingData.push({
        startTime: parseFloat(timingMatches[1]) * 1000,
        endTime: parseFloat(timingMatches[2]) * 1000,
        verse: timingMatches[3],
      });
    }

    const chapterJson = sfmJson.chapters ? sfmJson.chapters[chapterNumber] : undefined;
    if (!chapterJson) {
      return [];
    }
    let currentTimingIndex = 0;
    // set timingIndex to index of first verse number
    while (
      isNaN(parseInt(timingData[currentTimingIndex].verse)) ||
      parseInt(timingData[currentTimingIndex].verse) < 0
    ) {
      if (currentTimingIndex < timingData.length - 1) {
        currentTimingIndex++;
      } else {
        currentTimingIndex = -1;
        break;
      }
    }

    const verseTextArray: string[] = [];
    let segmentId = 0;
    let startTime = 0;
    let endTime = 0;
    for (const verseNumber in chapterJson) {
      // exit if the end of the timing data is reached
      if (currentTimingIndex === -1) {
        break;
      }

      let timingVerse = '';
      if (timingData[currentTimingIndex]?.verse) {
        timingVerse = timingData[currentTimingIndex].verse;
      }

      let verseBridge: string[] = [];
      // skip segment if wrong verse
      if (Number.isInteger(parseInt(timingVerse))) {
        if (parseInt(verseNumber) < parseInt(timingVerse)) {
          continue;
        }
        while (
          parseInt(verseNumber) >
          Math.max(
            parseInt(timingData[currentTimingIndex].verse),
            parseInt(timingData[currentTimingIndex].verse.split('-')[1] ?? 0)
          )
        ) {
          if (currentTimingIndex < timingData.length - 1) {
            currentTimingIndex++;
          } else {
            currentTimingIndex = -1;
            break;
          }
        }
        if (currentTimingIndex === -1) {
          break;
        }
      }

      // allowance for verse bridge numbers, e.g. 10-11, that combines the verses into one
      if (timingVerse) {
        verseBridge = timingVerse.split('-');
      }

      if (verseBridge.length > 1) {
        if (parseInt(verseNumber) === parseInt(verseBridge[0])) {
          startTime = timingData[currentTimingIndex].startTime;
        }
        verseTextArray.push(getVerseText(chapterJson[verseNumber]));
        if (parseInt(verseNumber) < parseInt(verseBridge[1])) {
          continue;
        } else {
          endTime = timingData[currentTimingIndex].endTime;
          if (startTime === endTime) {
            if (currentTimingIndex < timingData.length - 1) {
              endTime = timingData[currentTimingIndex + 1].startTime;
            }
          }
          segments.push({
            segmentId,
            text: verseTextArray.join(' '),
            verse: timingVerse,
            startTime,
            length: endTime - startTime,
            isHeading: false,
            extraTimings: [],
          });
          segmentId++;
          if (currentTimingIndex < timingData.length - 1) {
            currentTimingIndex++;
          } else {
            currentTimingIndex = -1;
          }
          continue;
        }
      }

      startTime = timingData[currentTimingIndex].startTime;
      endTime = timingData[currentTimingIndex].endTime;

      const verseText = getVerseText(chapterJson[verseNumber]);

      if (!verseText || startTime == null || endTime == null) {
        continue;
      }

      let currentWord = 0;
      let currentPhrase = 0;
      const phraseArray = createPhraseArray(verseText, phraseEndChars);

      const extraTimings: ExtraTiming[] = [];

      // gets timing info if the verse number is correct or if it is blank (blank meaning next phrase of current verse)
      while (
        parseInt(timingData[currentTimingIndex].verse) === parseInt(verseNumber) ||
        !timingData[currentTimingIndex].verse
      ) {
        // if start and end times are the same, set end time to start of next timing
        // if it is the last timing data of the chapter, leave them the same and timings.ts will sort it out
        if (timingData[currentTimingIndex].startTime === timingData[currentTimingIndex].endTime) {
          if (currentTimingIndex < timingData.length - 1) {
            endTime = timingData[currentTimingIndex + 1].startTime;
          }
        } else {
          endTime = timingData[currentTimingIndex].endTime;
        }

        // match the verse string from the timing data:
        // verse number, then letter to indicate phrase number, underscore then word number
        // e.g. 1b_3; verse 1, phrase 2, word 3
        const verseRegex = /\d+([a-z]*)_?(\d*)/;
        let match: RegExpMatchArray | null | undefined;
        let wordNum = 0;
        const extraTimingStart = timingData[currentTimingIndex].startTime;
        let extraTimingEnd = timingData[currentTimingIndex].endTime;

        if (!timingData[currentTimingIndex].verse) {
          wordNum = currentWord;
        } else {
          match = timingData[currentTimingIndex].verse.match(verseRegex);
        }
        if (match) {
          // match[1] is the letter representing the phrase
          if (match[1]) {
            // count words for current phrase
            const phraseNumber = lettersToNumber(match[1]);
            if (phraseNumber < currentPhrase) {
              if (phraseArray[currentPhrase - 1]) {
                currentWord -= this.numberOfWords(phraseArray[currentPhrase - 1]);
              } else {
                currentWord = 0;
              }
              currentPhrase = phraseNumber;
            } else {
              while (phraseNumber > currentPhrase) {
                if (phraseArray[currentPhrase]) {
                  currentWord += this.numberOfWords(phraseArray[currentPhrase]);
                }
                currentPhrase++;
              }
            }
            // match[2] is the word number within the phrase
            if (match[2]) {
              wordNum = currentWord + parseInt(match[2]) - 1;
            } else {
              wordNum = currentWord;
            }
          } else if (match[2]) {
            wordNum = parseInt(match[2]) - 1;
          } else {
            wordNum = currentWord;
          }
        }

        // if start and end times are the same, set end time to start of next timing
        // if it is the last timing data of the segment, leave them the same and timings.ts will sort it out
        if (extraTimingStart === extraTimingEnd && currentTimingIndex < timingData.length - 1) {
          extraTimingEnd = timingData[currentTimingIndex + 1].startTime;
        }
        extraTimings.push({
          wordNum,
          start: extraTimingStart,
          end: extraTimingEnd,
        });

        if (phraseArray[currentPhrase]) {
          currentWord += this.numberOfWords(phraseArray[currentPhrase]);
        }
        currentPhrase++;

        // exit if the end of the timing data is reached
        if (currentTimingIndex < timingData.length - 1) {
          currentTimingIndex++;
        } else {
          currentTimingIndex = -1;
          break;
        }
      }

      segments.push({
        segmentId,
        text: verseText,
        verse: verseNumber,
        startTime,
        length: endTime - startTime,
        isHeading: false,
        extraTimings,
      });
      segmentId++;
    }
    return segments;
  }

  /**
   * Gets the audio file path.
   * @param file - path to the file, may just be a filename.
   * @param directory - path of the directory containing the project.
   * @param projectName - name of the project.
   * @returns the path to the audio file, or `undefined` if not found.
   */
  private getAudioFilePath(file: string, directory: string, projectName: string): string | undefined {
    if (fs.existsSync(file)) {
      return file;
    }

    const split = file.split(path.sep);
    const projectPath = path.join(directory, projectName);
    const projectDataDirectoryName = `${projectName}_data`;
    if (split.length === 1 && split[0] === file) {
      // filePath is just a filename
      const audioFilePath = path.join(projectPath, projectDataDirectoryName, 'audio', file);
      if (fs.existsSync(audioFilePath)) {
        // found in default audio file location
        return audioFilePath;
      }
    }

    const dirList = fs.readdirSync(projectPath);
    dirList.splice(dirList.indexOf(`${projectName}.appDef`), 1);
    dirList.splice(dirList.indexOf(projectDataDirectoryName), 1);
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

  private numberOfWords(phrase: string): number {
    return phrase.split(' ').filter((w) => w).length;
  }
}

export default new ScriptureAppBuilder();
