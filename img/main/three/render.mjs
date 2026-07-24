// Renders a Three.js page in headless Chrome and screenshots the <canvas> to a PNG.
// Usage: node render.mjs <url> <outPath> [width] [height]
import puppeteer from 'puppeteer-core';
import os from 'node:os';
import path from 'node:path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [, , url, outPath, widthArg, heightArg] = process.argv;
const width = Number(widthArg || 1600);
const height = Number(heightArg || 1200);

if (!url || !outPath) {
  console.error('Usage: node render.mjs <url> <outPath> [width] [height]');
  process.exit(1);
}

const userDataDir = path.join(os.tmpdir(), `pptr-profile-${Date.now()}-${Math.random().toString(36).slice(2)}`);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  userDataDir,
  args: [
    '--use-gl=angle',
    '--use-angle=metal',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--force-color-profile=srgb',
    '--disk-cache-size=0',
    `--window-size=${width},${height}`,
  ],
  defaultViewport: { width, height, deviceScaleFactor: 1 },
});

try {
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('[page]', msg.text()));
  page.on('pageerror', (err) => console.error('[pageerror]', err));
  page.on('requestfailed', (req) => console.error('[reqfailed]', req.url(), req.failure()?.errorText));
  page.on('response', (res) => {
    if (res.status() >= 400) console.error('[http', res.status() + ']', res.url());
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForFunction('window.__rendered === true', { timeout: 30000 });

  const canvasHandle = await page.$('canvas');
  if (!canvasHandle) {
    throw new Error('no <canvas> found on page');
  }
  await canvasHandle.screenshot({ path: outPath });
  console.log('saved', outPath);
} finally {
  await browser.close();
}
