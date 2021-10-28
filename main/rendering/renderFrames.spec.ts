import test from 'ava';
import { AnimationSettings } from '../../src/models/animationSettings.model';
import { Timings } from '../models/timings.model';
import { getHtml } from './renderFrames';

test('getHtml() loads html from template', async (t) => {
  const style = mockStyle();
  const timings = mockTimings();
  const htmlContent = await getHtml(timings, style);
  const regexPatterns = [
    /font-family: "Arial";/,
    /font-size: 20pt;/,
    /color: #555;/,
    /font-style: "italic";/,
    /font-weight: "normal";/,
    /const highlightColor = 'rgba\(255, 255, 0, 1\)';/,
    /background: #333;/,
    /const speechBubbleColor = 'rgba\(255, 255, 255, 1\)'/,
    /const speechBubbleOpacity = 1;/,
  ];
  t.plan(regexPatterns.length);
  regexPatterns.forEach((pattern) => {
    t.regex(htmlContent, pattern);
  });
});

test('getHtml() timing words are present in html', async (t) => {
  const style = mockStyle();
  const timings = mockTimings();
  const htmlContent = await getHtml(timings, style);
  t.regex(htmlContent, new RegExp('const timings = ' + JSON.stringify(timings).replace(/\[/g, '\\[')));
});

function mockStyle(): AnimationSettings {
  return {
    text: {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#555',
      italic: true,
      bold: false,
      highlightColor: 'yellow',
      highlightRGB: 'rgba(255, 255, 0, 1)',
    },
    background: {
      type: 'color',
      file: '',
      color: '#333',
    },
    speechBubble: {
      color: '#FFF',
      rgba: 'rgba(255, 255, 255, 1)',
      opacity: 1,
    },
    output: {
      directory: '',
      filename: '',
      overwriteOutputFiles: true,
    },
    textLocation: {
      location: 'center',
    },
  };
}

function mockTimings(): Timings {
  return [
    {
      type: 'caption',
      index: 1,
      start: 0,
      end: 100,
      duration: 100,
      content: 'Hello World',
      text: '',
      isHeading: false,
      words: [
        { word: 'Hello', start: 1, end: 5 },
        { word: 'World', start: 6, end: 10 },
      ],
    },
  ];
}
