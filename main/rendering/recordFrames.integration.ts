import fs from 'fs';
import path from 'path';
import test from 'ava';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import tmp from 'tmp-promise';
import { AnimationSettings } from '../../src/models/animationSettings.model';
import { Timings } from '../models/timings.model';
import { record } from './recordFrames';
import { getHtml } from './renderFrames';

test('recordFrames: render 5 mock frames', async (t) => {
  const htmlContent = createMockHtml();
  const numberOfFrames = 5;
  tmp.setGracefulCleanup();
  const { path: outputLocation, cleanup } = await tmp.dir({ unsafeCleanup: true });
  const emptyDirectory = fs.readdirSync(outputLocation);
  t.is(emptyDirectory.length, 0);

  await record(htmlContent, numberOfFrames, outputLocation);

  const directoryOfFrameFiles = fs.readdirSync(outputLocation);
  t.is(directoryOfFrameFiles.length, numberOfFrames);
  cleanup();
});

test('recordFrames: verify frames are not all the same', async (t) => {
  const style = mockStyle();
  const timings = mockTimings();
  const htmlContent = await getHtml(timings, style);
  const numberOfFrames = 75;
  tmp.setGracefulCleanup();
  const { path: outputLocation, cleanup } = await tmp.dir({ unsafeCleanup: true });
  const emptyDirectory = fs.readdirSync(outputLocation);
  t.is(emptyDirectory.length, 0);

  await record(htmlContent, numberOfFrames, outputLocation);

  const directoryOfFrameFiles = fs.readdirSync(outputLocation);
  t.is(directoryOfFrameFiles.length, numberOfFrames);

  const diffPixels = [];
  // loop through generated images and stop at every 15th (1 second)
  for (let i = 1; i < directoryOfFrameFiles.length; i = i + 15) {
    // generate compare image names
    const imagePad1 = i.toString().padStart(6, '0');
    const imagePad2 = (i + 1).toString().padStart(6, '0');
    // read compare images
    const img1 = PNG.sync.read(fs.readFileSync(path.join(outputLocation, 'frame_' + imagePad1 + '.png')));
    const img2 = PNG.sync.read(fs.readFileSync(path.join(outputLocation, 'frame_' + imagePad2 + '.png')));
    // get the image dimensions and create a placeholder PNG
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    // for each set of images use pixelmatch to find the number of different pixels
    diffPixels.push(pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0 }));
    // TIP: if you would like to see a PNG that shows the differences of the images uncomment this line
    // fs.writeFileSync('diff_'+i+'.png', PNG.sync.write(diff));
  }
  // store the number of times the compares do not change from second to second
  let noChange = 0;
  diffPixels.forEach((diff) => {
    if (diff == 0) {
      noChange++;
    }
  });
  // we want to verify that none of our test compares were identical
  t.is(noChange, 0);

  // TIP: uncomment if you need a new set of diffPixels
  // console.log("diffPixels: ", diffPixels);
  // compare the diff pixes to what was expected
  // const expectedDiff = [ 42041, 748, 1251, 604, 1589 ];
  // t.deepEqual(diffPixels, expectedDiff);

  cleanup();
});

function createMockHtml(): string {
  // mocks render.html
  return `
  <html>
  <script>
  function renderNextFrame(time) {}
  </script>
  <body>
  </body>
  </html>
  `;
}

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
      index: 0,
      start: 0,
      end: 5000,
      duration: 5000,
      content: 'This is just a test.',
      text: '',
      isHeading: false,
      words: [
        { word: 'This', start: 0, end: 1000 },
        { word: 'is', start: 1001, end: 2000 },
        { word: 'just', start: 2001, end: 3000 },
        { word: 'a', start: 3001, end: 4000 },
        { word: 'test.', start: 4001, end: 5000 },
      ],
    },
  ];
}
