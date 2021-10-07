import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { xml2json } from 'xml-js';
import { paths } from '../../path-constants';
import { BKProject, BKChapter } from '../../models/projectFormat.model';
import { ConvertProject, ConvertBook, ConvertChapter } from '../../models/convertFormat.model';

//Defines a ScriptLine as expected after parsing the hearthis xml
export interface ScriptLine {
  LineNumber: { _text: string };
  Text: { _text: string };
  RecordingTime: { _text: string };
  Verse: { _text: string };
  Heading: { _text: string };
  HeadingType?: { _text: string };
}

async function convertChapter(chapter: ConvertChapter, book: ConvertBook, project: ConvertProject): Promise<BKChapter> {
  const chapterDetails: BKChapter = {
    name: chapter.name,
    audio: {
      files: [],
      length: 0,
    },
    segments: [],
  };
  const sourceChapterDir = path.join(project.fullPath, book.name, chapter.name);
  const sourceDirectoryFiles = fs.readdirSync(sourceChapterDir, 'utf8');
  const infoXmlPath = path.join(sourceChapterDir, 'info.xml');

  const infoXmlFileContents = fs.readFileSync(infoXmlPath, { encoding: 'utf-8' });
  const chapterInfo = JSON.parse(xml2json(infoXmlFileContents, { compact: true }));
  // make sure ScriptLine is an array
  if (!Array.isArray(chapterInfo.ChapterInfo.Recordings.ScriptLine)) {
    chapterInfo.ChapterInfo.Recordings.ScriptLine = [chapterInfo.ChapterInfo.Recordings.ScriptLine];
  }

  let chapterAudioLength = 0;
  for await (const scriptLine of chapterInfo.ChapterInfo.Recordings.ScriptLine as ScriptLine[]) {
    // Fix #20 : ignore Chapter Headings
    if (scriptLine.HeadingType?._text === 'c' && scriptLine.Verse._text === '0') {
      continue;
    }

    const segmentId = parseInt(scriptLine.LineNumber._text, 10);
    const audioFileName = `${segmentId - 1}.wav`;
    const audioPath: string = path.join(sourceChapterDir, audioFileName);
    // ignore scriptLines with no corresponding audio file
    if (!sourceDirectoryFiles.includes(audioFileName)) {
      continue;
    }
    const duration = await getAudioDurationInMilliseconds(audioPath);

    chapterDetails.audio.files.push({ filename: audioPath, length: duration });

    chapterDetails.segments.push({
      segmentId,
      text: scriptLine.Text._text,
      verse: scriptLine.Verse._text,
      startTime: chapterAudioLength,
      length: duration,
      isHeading: scriptLine.Heading._text === 'true',
    });
    chapterAudioLength += duration;
    chapterDetails.audio.length = chapterAudioLength;
  }

  return chapterDetails;
}

export async function bkImport(project: ConvertProject): Promise<BKProject> {
  const bkProject: BKProject = { name: project.name, dirName: project.fullPath, books: [] };
  for await (const book of project.books) {
    const chapters = [];
    for await (const chapter of book.chapters) {
      const result = await convertChapter(chapter, book, project);
      chapters.push(result);
    }
    bkProject.books.push({ name: book.name, chapters });
  }
  return bkProject;
}

// Adapted from https://github.com/caffco/get-audio-duration:
async function getAudioDurationInMilliseconds(filePath: string): Promise<number> {
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
