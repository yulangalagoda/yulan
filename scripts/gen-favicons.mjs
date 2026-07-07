// Regenerates the raster favicons from public/favicon.svg — the committed brand
// mark (a green serif “Y”). Favicons are a fixed brand asset, no longer derived
// from the Notion logo at build time, so run this only when favicon.svg changes:
//
//   node scripts/gen-favicons.mjs
//
// Writes public/favicon-16.png, favicon-32.png, favicon.ico and
// apple-touch-icon.png.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUB = path.join(process.cwd(), 'public');
const CREAM = { r: 251, g: 250, b: 247, alpha: 1 };

const svg = await fs.readFile(path.join(PUB, 'favicon.svg'));

// Transparent-background icons for the browser tab.
for (const size of [16, 32]) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await fs.writeFile(path.join(PUB, `favicon-${size}.png`), buf);
}

// favicon.ico substitute: a 32×32 PNG named .ico (browsers accept it).
const ico = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer();
await fs.writeFile(path.join(PUB, 'favicon.ico'), ico);

// Apple touch icon: 180×180 flattened onto cream (iOS masks to a rounded rect,
// so the corners must not be transparent).
const apple = await sharp(svg, { density: 512 })
  .resize(180, 180, { fit: 'contain', background: CREAM })
  .flatten({ background: CREAM })
  .png()
  .toBuffer();
await fs.writeFile(path.join(PUB, 'apple-touch-icon.png'), apple);

console.log('Favicons regenerated from public/favicon.svg.');
