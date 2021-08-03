import { Timings, LineTiming } from '../../../models/timings.model';
import { BKChapter } from '../../../models/projectFormat.model';

export function chapterFormatToTimings(chapter: BKChapter): Timings {
  const timings: Timings = [];
  for (const segment of chapter.segments) {
    const contentWords = segment.text.split(' ');
    const lineTiming: LineTiming = {
      type: 'caption',
      index: segment.segmentId,
      start: segment.startTime,
      end: segment.startTime + segment.length,
      duration: segment.length,
      content: segment.text,
      text: '',
      words: [],
      isHeading: segment.isHeading,
    };
    formatWords(contentWords, lineTiming);
    timings.push(lineTiming);
  }
  return timings;
}

function formatWords(words: string[], lineTiming: LineTiming): void {
  let start = lineTiming.start;
  for (const word of words) {
    const totalChars = lineTiming.content.length;

    // percent duration = wordLength/totalChars
    // NOTE: look at this if animation looks off.
    // +1 to account for an additional space after the word
    // problem might be last word in phrase...
    const percentDuration = (word.length + 1) / totalChars;

    // wordDuration = percentDuration * lineTiming.duration
    let end = start + Math.round(percentDuration * lineTiming.duration);

    // make sure end never goes beyond lineTiming.end
    if (end > lineTiming.end) {
      end = lineTiming.end;
    }

    lineTiming.words.push({ word, start, end });
    start = end;
  }
}
