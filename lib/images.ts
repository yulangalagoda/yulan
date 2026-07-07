import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'notion-images');
const DOCS_DIR = path.join(process.cwd(), 'public', 'notion-docs');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * `next build` renders routes in parallel workers that can all decide to
 * write the same asset at the same moment. Writing straight to the target
 * corrupts or errors (Windows locks the file outright), so write to a unique
 * temp file and rename it into place; if the rename loses the race because
 * another worker already produced the file, that copy is just as good.
 */
async function writeFileAtomic(filePath: string, buf: Buffer): Promise<void> {
  const tmp = `${filePath}.${process.pid}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, buf);
  try {
    await fs.rename(tmp, filePath);
  } catch {
    await fs.unlink(tmp).catch(() => {});
  }
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

  // In dev, re-downloading on every request rewrites files under public/,
  // which churns Next's file watcher mid-render. Reuse what's on disk.
  if (process.env.NODE_ENV !== 'production') {
    try {
      await fs.stat(filePath);
      return `/notion-images/${filename}`;
    } catch {
      // not downloaded yet — fall through
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[images] Failed to download ${url}: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFileAtomic(filePath, buf);
    return `/notion-images/${filename}`;
  } catch (err) {
    console.warn(`[images] Error downloading ${url}:`, err);
    return null;
  }
}

function docExtFromUrl(url: string, fallback = 'pdf'): string {
  try {
    const u = new URL(url);
    const m = u.pathname.toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    if (m) return m[1];
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Downloads a Notion-hosted document (e.g. a project's final report PDF) into
 * /public/notion-docs/<basename>.<ext> and returns its public path. Notion file
 * URLs are signed and expire after ~1 hour, so — like images — we copy them
 * into the static site at build time. `baseName` gives the download a clean,
 * human filename (e.g. "neteagle-report"). Returns null if there's no file.
 */
export async function downloadNotionFile(
  pageId: string,
  url: string,
  baseName: string
): Promise<string | null> {
  if (!url) return null;
  await ensureDir(DOCS_DIR);
  const ext = docExtFromUrl(url, 'pdf');
  const safe = (baseName || pageId.replace(/-/g, '')).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const filename = `${safe}.${ext}`;
  const filePath = path.join(DOCS_DIR, filename);

  if (process.env.NODE_ENV !== 'production') {
    try {
      await fs.stat(filePath);
      return `/notion-docs/${filename}`;
    } catch {
      // not downloaded yet — fall through
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[images] Failed to download doc ${url}: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFileAtomic(filePath, buf);
    return `/notion-docs/${filename}`;
  } catch (err) {
    console.warn(`[images] Error downloading doc ${url}:`, err);
    return null;
  }
}

/**
 * Produces a web-sized rendition of the hero portrait next to the original
 * (<name>-hero.webp). The Notion original can be a multi-MB phone photo; the
 * hero slot renders at ~440 CSS px wide, so 880px covers 2x displays. Falls
 * back to the original path if the conversion fails.
 */
export async function optimizeHeroImage(publicPath: string): Promise<string> {
  const absolute = path.join(PUBLIC_DIR, publicPath.replace(/^\.?\/+/, ''));
  const outName = path.basename(absolute).replace(/\.[a-z0-9]+$/i, '') + '-hero.webp';
  const outPath = path.join(OUTPUT_DIR, outName);
  const outPublic = `/notion-images/${outName}`;

  // Same dev guard as downloadNotionImage: don't rewrite public/ every request.
  if (process.env.NODE_ENV !== 'production') {
    try {
      await fs.stat(outPath);
      return outPublic;
    } catch {
      // not generated yet — fall through
    }
  }

  try {
    const buf = await sharp(absolute)
      .resize({ width: 880, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await writeFileAtomic(outPath, buf);
    return outPublic;
  } catch (err) {
    console.warn('[images] Failed to optimise hero portrait, using original:', err);
    return publicPath;
  }
}

const CV_DIR = path.join(PUBLIC_DIR, 'cv');
const CV_PUBLIC = '/cv/Yulan-Galagoda-CV.pdf';

/**
 * Downloads the CV/résumé from the Notion "Site Meta" row into
 * /public/cv/Yulan-Galagoda-CV.pdf, overwriting the committed default. A
 * committed copy is always present, so the download button works even before
 * anything is uploaded to Notion; uploading a new PDF and rebuilding replaces
 * it. Returns the stable public path (or null on failure).
 */
export async function downloadNotionCv(url: string): Promise<string | null> {
  if (!url) return null;
  await ensureDir(CV_DIR);
  const filePath = path.join(CV_DIR, 'Yulan-Galagoda-CV.pdf');
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[images] Failed to download CV ${url}: HTTP ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFileAtomic(filePath, buf);
    return CV_PUBLIC;
  } catch (err) {
    console.warn(`[images] Error downloading CV ${url}:`, err);
    return null;
  }
}

/**
 * Returns the public CV path with a content-hash cache-buster
 * (…/Yulan-Galagoda-CV.pdf?v=<hash>) so an updated CV always gets a fresh URL —
 * otherwise browsers and the CDN keep serving the previously-cached PDF. Reads
 * whatever is on disk (a Notion download if one happened, else the committed
 * default). Returns null only if no CV file exists.
 */
export async function cvVersionedPath(): Promise<string | null> {
  const filePath = path.join(CV_DIR, 'Yulan-Galagoda-CV.pdf');
  try {
    const buf = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
    return `${CV_PUBLIC}?v=${hash}`;
  } catch {
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

  // Same dev guard as downloadNotionImage: don't rewrite public/ every request.
  if (process.env.NODE_ENV !== 'production') {
    try {
      await fs.stat(path.join(PUBLIC_DIR, 'favicon.ico'));
      return;
    } catch {
      // not generated yet — fall through
    }
  }

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
    await writeFileAtomic(path.join(PUBLIC_DIR, 'favicon.ico'), buf32);
    await writeFileAtomic(path.join(PUBLIC_DIR, 'favicon-32.png'), buf32);

    // 16×16 PNG
    const buf16 = await sharp(absolute)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await writeFileAtomic(path.join(PUBLIC_DIR, 'favicon-16.png'), buf16);

    // 180×180 Apple touch icon
    const buf180 = await sharp(absolute)
      .resize(180, 180, { fit: 'contain', background: { r: 250, g: 248, b: 244, alpha: 1 } })
      .png()
      .toBuffer();
    await writeFileAtomic(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), buf180);
  } catch (err) {
    console.warn('[images] Failed to generate favicon assets:', err);
  }
}
