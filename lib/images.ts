import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'notion-images');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function extFromUrl(url: string, fallback = 'png'): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    const match = pathname.match(/\.(png|jpg|jpeg|webp|gif|svg|ico)$/);
    if (match) return match[1];
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Downloads a Notion-hosted file and writes it to /public/notion-images/<page-id>.<ext>.
 * Notion file URLs are signed and expire after about one hour, so we re-download
 * on every build. Returns the public URL path that can be used directly in <img>.
 */
export async function downloadNotionImage(pageId: string, url: string): Promise<string | null> {
  if (!url) return null;
  await ensureDir(OUTPUT_DIR);
  const ext = extFromUrl(url, 'png');
  const safeId = pageId.replace(/-/g, '');
  const filename = `${safeId}.${ext}`;
  const filePath = path.join(OUTPUT_DIR, filename);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[images] Failed to download ${url}: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filePath, buf);
    return `./notion-images/${filename}`;
  } catch (err) {
    console.warn(`[images] Error downloading ${url}:`, err);
    return null;
  }
}

/**
 * Generates favicon assets (ICO, 16x16, 32x32, and 180x180 Apple touch) from a
 * source logo. Writes to /public so they sit at the site root.
 */
export async function generateFavicons(logoPublicPath: string): Promise<void> {
  // logoPublicPath is e.g. "/notion-images/abc.png" — convert to absolute file path.
  const absolute = path.join(PUBLIC_DIR, logoPublicPath.replace(/^\.?\/+/, ''));

  try {
    const stat = await fs.stat(absolute);
    if (!stat.isFile()) return;
  } catch {
    console.warn(`[images] Logo file missing, skipping favicon generation: ${absolute}`);
    return;
  }

  try {
    // 32×32 PNG (used as ICO substitute — many browsers accept a PNG named .ico)
    const buf32 = await sharp(absolute)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, 'favicon.ico'), buf32);
    await fs.writeFile(path.join(PUBLIC_DIR, 'favicon-32.png'), buf32);

    // 16×16 PNG
    const buf16 = await sharp(absolute)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, 'favicon-16.png'), buf16);

    // 180×180 Apple touch icon
    const buf180 = await sharp(absolute)
      .resize(180, 180, { fit: 'contain', background: { r: 250, g: 248, b: 244, alpha: 1 } })
      .png()
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), buf180);
  } catch (err) {
    console.warn('[images] Failed to generate favicon assets:', err);
  }
}
