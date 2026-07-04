// Indicator-of-compromise extraction for the /lab/ioc instrument.
//
// Paste a log, a phishing email's source, or a threat-intel blob and pull out
// the artefacts a SOC analyst actually pivots on: IPs, domains, URLs, emails,
// file hashes and CVE IDs — de-duplicated, with private/reserved IPs flagged
// and an option to defang everything for safe sharing. Pure string work; the
// text never leaves the browser.

export type IocType =
  | 'ipv4'
  | 'ipv6'
  | 'domain'
  | 'url'
  | 'email'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'cve';

export interface IocItem {
  value: string;
  /** Extra note, e.g. "private" for RFC-1918 addresses. */
  note?: string;
}

export interface IocGroup {
  type: IocType;
  label: string;
  items: IocItem[];
}

export interface ExtractResult {
  groups: IocGroup[];
  total: number;
}

// TLD-position tokens that are almost always file extensions, not domains.
const FILE_EXTS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'pdf', 'doc', 'docx',
  'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'gz', 'tar', 'rar', '7z', 'exe', 'dll',
  'js', 'ts', 'jsx', 'tsx', 'css', 'html', 'htm', 'json', 'xml', 'yml', 'yaml',
  'md', 'txt', 'csv', 'py', 'sh', 'bat', 'ps1', 'bin', 'dat', 'log', 'conf',
  'ini', 'sql', 'db', 'bak', 'tmp', 'lock', 'map', 'woff', 'woff2', 'ttf',
]);

const RE = {
  url: /\bhttps?:\/\/[^\s"'<>`)\]}]+/gi,
  email: /\b[a-z0-9._%+-]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi,
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  ipv6: /\b(?:[a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}\b/gi,
  domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi,
  sha256: /\b[a-f0-9]{64}\b/gi,
  sha1: /\b[a-f0-9]{40}\b/gi,
  md5: /\b[a-f0-9]{32}\b/gi,
  cve: /\bCVE-\d{4}-\d{4,7}\b/gi,
};

/**
 * Refang defanged intel so the extractors can see it: hxxp→http, [.]/(.)/[dot]→.,
 * [@]/[at]→@, [:]→:. Case-insensitive on the scheme.
 */
export function refang(text: string): string {
  return text
    .replace(/h(?:xx|XX|tt)ps?(?=:?\/\/|\[:\])/gi, (m) => (/s$/i.test(m) ? 'https' : 'http'))
    .replace(/\[?\s*(?:\.|dot|DOT)\s*\]|\(\s*(?:\.|dot)\s*\)|\{\s*\.\s*\}/gi, '.')
    .replace(/\[\s*(?:@|at|AT)\s*\]|\(\s*at\s*\)/gi, '@')
    .replace(/\[\s*:\s*\/\/\s*\]/g, '://')
    .replace(/\[\s*:\s*\]/g, ':')
    .replace(/\s+(?:dot|DOT)\s+/g, '.');
}

function isPrivateIp(ip: string): boolean {
  const p = ip.split('.').map(Number);
  if (p.length !== 4) return false;
  const [a, b] = p;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    a === 0
  );
}

function uniqueLower(matches: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const key = m.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

export function extractIocs(raw: string): ExtractResult {
  const text = refang(raw || '');
  const groups: IocGroup[] = [];

  const grab = (re: RegExp) => text.match(re) ?? [];

  // Hashes first, longest-to-shortest, removing matched spans so a SHA-256
  // isn't also reported as three separate MD5s.
  let hashText = text;
  const pull = (re: RegExp): string[] => {
    const found = uniqueLower(hashText.match(re) ?? []);
    for (const f of found) hashText = hashText.split(f).join(' ');
    return found;
  };
  const sha256 = pull(RE.sha256);
  const sha1 = pull(RE.sha1);
  const md5 = pull(RE.md5);

  const urls = uniqueLower(grab(RE.url));
  const emails = uniqueLower(grab(RE.email));
  const ipv4 = uniqueLower(grab(RE.ipv4));
  const ipv6 = uniqueLower(grab(RE.ipv6)).filter((v) => v.includes('::') || v.split(':').length >= 4);
  const cves = uniqueLower(grab(RE.cve)).map((c) => c.toUpperCase());

  // Domains: drop file-like tokens and anything that's actually an IPv4.
  const domains = uniqueLower(grab(RE.domain)).filter((d) => {
    const tld = d.split('.').pop()!.toLowerCase();
    if (FILE_EXTS.has(tld)) return false;
    if (RE.ipv4.test(d)) {
      RE.ipv4.lastIndex = 0;
      return false;
    }
    return true;
  });

  const push = (type: IocType, label: string, items: IocItem[]) => {
    if (items.length) groups.push({ type, label, items });
  };

  push('url', 'URLs', urls.map((v) => ({ value: v })));
  push('domain', 'Domains', domains.map((v) => ({ value: v })));
  push(
    'ipv4',
    'IPv4 addresses',
    ipv4.map((v) => ({ value: v, note: isPrivateIp(v) ? 'private' : undefined }))
  );
  push('ipv6', 'IPv6 addresses', ipv6.map((v) => ({ value: v })));
  push('email', 'Email addresses', emails.map((v) => ({ value: v })));
  push('sha256', 'SHA-256 hashes', sha256.map((v) => ({ value: v })));
  push('sha1', 'SHA-1 hashes', sha1.map((v) => ({ value: v })));
  push('md5', 'MD5 hashes', md5.map((v) => ({ value: v })));
  push('cve', 'CVE IDs', cves.map((v) => ({ value: v })));

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return { groups, total };
}

/** Defang a value so it's safe to paste into tickets, chat and email. */
export function defang(value: string, type: IocType): string {
  if (type === 'ipv4' || type === 'ipv6' || type === 'domain' || type === 'url' || type === 'email') {
    let v = value.replace(/\./g, '[.]');
    v = v.replace(/^http(s?):\/\//i, (_m, s) => `hxxp${s}[://]`);
    v = v.replace(/@/g, '[at]');
    return v;
  }
  return value;
}

export function toCsv(result: ExtractResult, defanged: boolean): string {
  const rows = ['type,indicator,note'];
  for (const g of result.groups) {
    for (const it of g.items) {
      const val = defanged ? defang(it.value, g.type) : it.value;
      rows.push(`${g.type},"${val.replace(/"/g, '""')}",${it.note ?? ''}`);
    }
  }
  return rows.join('\n');
}

export function toPlain(result: ExtractResult, defanged: boolean): string {
  const out: string[] = [];
  for (const g of result.groups) {
    out.push(`# ${g.label} (${g.items.length})`);
    for (const it of g.items) {
      out.push(defanged ? defang(it.value, g.type) : it.value);
    }
    out.push('');
  }
  return out.join('\n').trim();
}
