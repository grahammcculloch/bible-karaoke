import puppeteer from 'puppeteer-core';
import { path as chromiumPath } from 'chromium';
import path from 'path';
import { EventEmitter } from 'events';

// function defined in render.html
declare function renderNextFrame(
  time?: number // milliseconds
): void;

export async function record(
  htmlContent: string,
  numberOfFrames: number,
  outputLocation: string,
  logEachFrame = false,
  notifyEvent?: EventEmitter
): Promise<void> {
  const browser = await puppeteer.launch({
    // chromium.path may or may not provide a path in an asar archive.  If it does
    // it is unusable, and we'll attempt to swap it out for the un-archived version
    executablePath: chromiumPath.replace('app.asar', 'app.asar.unpacked'),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 720,
    height: 480,
  });
  await page.setContent(htmlContent);

  for (let i = 1; i <= numberOfFrames; i++) {
    if (logEachFrame) console.log(`[puppeteer-recorder] rendering frame ${i} of ${numberOfFrames}.`);

    await page.evaluate(() => {
      // executing in browser
      renderNextFrame();
    });

    const paddedIndex = `${i}`.padStart(6, '0');
    const filename = `frame_${paddedIndex}.png`;
    await page.screenshot({
      omitBackground: false,
      path: path.join(outputLocation, filename),
    });
    if (notifyEvent != null) {
      const eventData: RecordFrameEventData = { currentFrame: i, totalFrames: numberOfFrames };
      notifyEvent.emit('rendered', eventData);
    }
  }
}

export interface RecordFrameEventData {
  currentFrame: number;
  totalFrames: number;
}
