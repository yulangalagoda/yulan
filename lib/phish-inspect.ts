// Phishing URL inspector for the /lab/phish instrument.
//
// Pulls a URL apart and flags the tricks phishers use: lookalike/homoglyph
// domains, brand names that sit in a subdomain or path while the real
// registrable domain is something else, typosquats, abused TLDs, the userinfo
// "@" trick, raw-IP hosts, and alarming keywords. It reasons purely about the
// string — it never fetches the URL — so it can't follow redirects or judge
// content; it tells you where a link actually points and why that should
// worry you.

export type Severity = 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

export interface UrlAnatomy {
  scheme: string;
  userinfo?: string;
  subdomain?: string;
  registrable: string;
  tld: string;
  port?: string;
  path: string;
  rawHost: string;
}

export interface PhishReport {
  input: string;
  valid: boolean;
  anatomy?: UrlAnatomy;
  findings: Finding[];
  score: number;
  verdict: string;
}

const BRANDS = [
  'google', 'paypal', 'microsoft', 'apple', 'amazon', 'facebook', 'instagram',
  'netflix', 'whatsapp', 'linkedin', 'dropbox', 'coinbase', 'binance', 'metamask',
  'wellsfargo', 'bankofamerica', 'chase', 'hsbc', 'barclays', 'santander',
  'steam', 'ebay', 'outlook', 'office365', 'icloud', 'gmail', 'yahoo', 'dhl',
  'fedex', 'ups', 'usps', 'revolut', 'monzo', 'stripe', 'roblox', 'discord',
];

// TLDs disproportionately abused for phishing / drive-by (illustrative).
const RISKY_TLDS = new Set([
  'zip', 'mov', 'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click',
  'link', 'country', 'kim', 'science', 'party', 'gdn', 'review', 'stream',
  'download', 'racing', 'win', 'bid', 'loan', 'men', 'date', 'quest', 'rest',
]);

const SHORTENERS = new Set([
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly',
  'cutt.ly', 'rebrand.ly', 'shorturl.at', 'rb.gy', 'tny.im',
]);

// Registrable-domain approximation: two labels, unless the last two are a known
// multi-part public suffix, in which case take three. Not the full PSL, but
// honest enough for triage (noted on the page).
const MULTI_SUFFIX = new Set([
  'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk',
  'com.au', 'net.au', 'org.au', 'gov.au', 'co.nz', 'co.jp', 'or.jp', 'ne.jp',
  'co.in', 'net.in', 'org.in', 'com.br', 'com.cn', 'com.mx', 'co.za', 'com.sg',
  'com.hk', 'com.tr', 'co.kr', 'com.tw',
]);

const KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'secure', 'account', 'update',
  'confirm', 'banking', 'wallet', 'password', 'unlock', 'suspended', 'billing',
  'invoice', 'payment', 'recover', 'support', 'alert', 'security',
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

function scriptsOf(str: string): Set<string> {
  const s = new Set<string>();
  for (const ch of str) {
    const c = ch.codePointAt(0)!;
    if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) s.add('latin');
    else if (c >= 0x400 && c <= 0x4ff) s.add('cyrillic');
    else if (c >= 0x370 && c <= 0x3ff) s.add('greek');
    else if (c > 0x7f) s.add('other');
  }
  return s;
}

function registrableOf(host: string): { registrable: string; subdomain?: string; tld: string } {
  const labels = host.split('.').filter(Boolean);
  if (labels.length <= 2) {
    return { registrable: host, tld: labels[labels.length - 1] ?? '' };
  }
  const lastTwo = labels.slice(-2).join('.');
  const take = MULTI_SUFFIX.has(lastTwo) ? 3 : 2;
  const reg = labels.slice(-take).join('.');
  const sub = labels.slice(0, labels.length - take).join('.');
  return { registrable: reg, subdomain: sub || undefined, tld: labels[labels.length - 1] };
}

const IP_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export function inspectUrl(input: string): PhishReport {
  const raw = input.trim();
  if (!raw) return { input: raw, valid: false, findings: [], score: 0, verdict: 'Enter a URL' };

  // Grab the raw authority from the typed text (before URL() punycodes it) so
  // we can see homoglyphs and the userinfo trick as a human would.
  const noScheme = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
  const rawAuthority = noScheme.split(/[/?#]/)[0];
  const hadScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw);

  let url: URL;
  try {
    url = new URL(hadScheme ? raw : `http://${raw}`);
  } catch {
    return { input: raw, valid: false, findings: [], score: 0, verdict: 'Not a valid URL' };
  }

  const findings: Finding[] = [];
  const add = (severity: Severity, title: string, detail: string) =>
    findings.push({ severity, title, detail });

  const host = url.hostname.replace(/\.$/, '');
  const isIp = IP_RE.test(host) || host.startsWith('[');
  const { registrable, subdomain, tld } = isIp
    ? { registrable: host, subdomain: undefined, tld: '' }
    : registrableOf(host);
  const secondLevel = registrable.split('.')[0] ?? registrable;
  const path = (url.pathname || '/') + url.search;

  const anatomy: UrlAnatomy = {
    scheme: url.protocol.replace(':', ''),
    userinfo: url.username ? url.username + (url.password ? ':…' : '') : undefined,
    subdomain,
    registrable,
    tld,
    port: url.port || undefined,
    path,
    rawHost: rawAuthority,
  };

  // ── the userinfo "@" trick ──────────────────────────────────
  if (url.username || rawAuthority.includes('@')) {
    add(
      'high',
      'Contains “@” before the host',
      `Everything before the “@” is a username the browser ignores. The real destination is ${host}, not what precedes it.`
    );
  }

  // ── raw IP host ─────────────────────────────────────────────
  if (isIp) {
    add('high', 'Host is a raw IP address', 'Legitimate services almost always use a domain name; a bare IP hides ownership.');
  }

  // ── homoglyph / IDN ─────────────────────────────────────────
  if (/[^\x00-\x7f]/.test(rawAuthority)) {
    const sc = scriptsOf(rawAuthority);
    const mixed = ['latin', 'cyrillic', 'greek'].filter((s) => sc.has(s)).length > 1;
    add(
      'high',
      mixed ? 'Mixed-script domain (homoglyph attack)' : 'Non-ASCII characters in the domain',
      mixed
        ? 'The domain mixes Latin with Cyrillic/Greek letters that look identical, a classic lookalike (e.g. “аpple” with a Cyrillic а).'
        : 'Unicode letters can be crafted to look like a trusted brand. Browsers may show this as punycode (xn--…).'
    );
  }
  if (/(^|\.)xn--/i.test(host)) {
    add('high', 'Punycode domain (xn--)', 'An internationalised domain encoded as ASCII, frequently used to disguise lookalike characters.');
  }

  // ── brand impersonation vs typosquat ────────────────────────
  if (!isIp) {
    const brandExact = BRANDS.includes(secondLevel.toLowerCase());
    const brandInLabels = BRANDS.find(
      (b) => (subdomain?.toLowerCase().includes(b) || path.toLowerCase().includes(b)) && secondLevel.toLowerCase() !== b
    );
    if (brandInLabels && !brandExact) {
      add(
        'high',
        `Impersonates “${brandInLabels}”`,
        `“${brandInLabels}” appears in the address, but the real registrable domain is ${registrable}, not ${brandInLabels}’s.`
      );
    }
    if (!brandExact) {
      for (const b of BRANDS) {
        const d = levenshtein(secondLevel.toLowerCase(), b);
        if (d > 0 && d <= 2 && Math.abs(secondLevel.length - b.length) <= 2) {
          add('high', `Looks like a typo of “${b}”`, `“${secondLevel}” is ${d} character${d === 1 ? '' : 's'} away from “${b}”, a likely typosquat.`);
          break;
        }
      }
    }
  }

  // ── risky TLD ───────────────────────────────────────────────
  if (tld && RISKY_TLDS.has(tld.toLowerCase())) {
    add('medium', `Abused TLD “.${tld}”`, `The .${tld} top-level domain is disproportionately used for phishing and malware.`);
  }

  // ── shortener ───────────────────────────────────────────────
  if (SHORTENERS.has(registrable.toLowerCase())) {
    add('medium', 'URL shortener', 'The real destination is hidden behind a redirect and can’t be resolved here, expand it before trusting it.');
  }

  // ── transport ───────────────────────────────────────────────
  if (anatomy.scheme !== 'https') {
    add('medium', `Not HTTPS (${anatomy.scheme})`, 'Traffic isn’t encrypted; a login form here would send credentials in the clear.');
  }

  // ── structure smells ────────────────────────────────────────
  const subCount = subdomain ? subdomain.split('.').length : 0;
  if (subCount >= 3) {
    add('medium', 'Deeply nested subdomains', `${subCount} subdomain levels, a common way to bury a trusted-looking name far from the real domain.`);
  }
  if (host.length > 30 && !isIp) {
    add('low', 'Unusually long host', 'Long, padded hostnames are used to push the real domain out of view on mobile.');
  }
  // (skip when punycode, whose xn-- encoding legitimately contains hyphens)
  if (!/xn--/i.test(host) && (host.match(/-/g)?.length ?? 0) >= 3) {
    add('low', 'Many hyphens in the host', 'Hyphen-heavy hostnames (secure-login-account-…) are a phishing staple.');
  }
  if (anatomy.port && !['80', '443'].includes(anatomy.port)) {
    add('low', `Non-standard port :${anatomy.port}`, 'Legitimate web services rarely expose an unusual port in a shared link.');
  }

  // ── social-engineering keywords ─────────────────────────────
  const hay = (host + ' ' + path).toLowerCase();
  const hits = KEYWORDS.filter((k) => hay.includes(k));
  if (hits.length >= 2) {
    add('low', 'Urgent / credential keywords', `Contains ${hits.slice(0, 4).map((h) => `“${h}”`).join(', ')}, wording engineered to create urgency.`);
  }

  const weight: Record<Severity, number> = { high: 40, medium: 18, low: 8, info: 0 };
  const score = Math.min(100, findings.reduce((n, f) => n + weight[f.severity], 0));
  const verdict =
    score >= 40 ? 'Likely phishing' : score >= 18 ? 'Suspicious' : score > 0 ? 'Minor flags' : 'No obvious red flags';

  // Sort most-severe first.
  const order: Severity[] = ['high', 'medium', 'low', 'info'];
  findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return { input: raw, valid: true, anatomy, findings, score, verdict };
}
