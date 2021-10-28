import fs from 'fs';
import test from 'ava';
import tmp from 'tmp-promise';
import { record } from './recordFrames';

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
