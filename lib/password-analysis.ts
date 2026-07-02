// Client-side password strength model for the /lab/password instrument.
//
// The model is deliberately transparent rather than a black box: it computes
// a naive brute-force entropy (length × log2 of the character pool), then
// subtracts the "discount" an informed attacker gets for every structural
// pattern it can find — dictionary hits, keyboard walks, sequences, repeats,
// years. The result is an *estimate* of guess entropy, mapped to crack times
// under a few explicit attacker profiles. Assumptions are documented on the
// page itself. Nothing here leaves the browser.

export interface PatternHit {
  type: 'common' | 'word' | 'sequence' | 'repeat' | 'keyboard' | 'year';
  token: string;
  note: string;
  /** Chars of the password this pattern covers. */
  span: number;
  /** Bits an attacker actually needs for this segment (replaces span × log2(pool)). */
  bits: number;
}

export interface CrackScenario {
  label: string;
  assumption: string;
  guessesPerSec: number;
  display: string;
}

export interface Analysis {
  length: number;
  poolSize: number;
  poolParts: string[];
  naiveBits: number;
  entropyBits: number;
  /** 0 = very weak … 4 = excellent */
  verdict: number;
  verdictLabel: string;
  patterns: PatternHit[];
  suggestions: string[];
  scenarios: CrackScenario[];
}

// Most-guessed passwords, ordered roughly by real-world frequency (drawn from
// the usual breach-corpus top lists). An attacker tries these before any
// brute force, so an exact hit costs ~log2(rank) bits, not its naive entropy.
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345', 'qwerty', '1234567',
  '111111', '1234567890', '123123', 'abc123', '1234', 'password1', 'iloveyou',
  '1q2w3e4r', '000000', 'qwerty123', 'zaq12wsx', 'dragon', 'sunshine',
  'princess', 'letmein', '654321', 'monkey', '27653', '1qaz2wsx', '123321',
  'qwertyuiop', 'superman', 'asdfghjkl', 'trustno1', 'jordan23', 'welcome',
  'password123', 'admin', 'football', 'baseball', 'shadow', 'michael',
  'jennifer', 'jessica', 'charlie', 'jordan', 'michelle', 'daniel', 'starwars',
  'klaster', 'george', 'computer', 'michaela', 'pepper', 'freedom', 'batman',
  'ginger', 'ninja', 'mustang', 'ashley', 'nicole', 'hunter', 'harley',
  'matrix', 'soccer', 'summer', 'internet', 'hannah', 'banana', 'master',
  'killer', 'hello', 'secret', 'flower', 'hottie', 'loveme', 'zxcvbnm',
  'access', 'buster', 'passw0rd', 'whatever', 'cookie', 'thomas', 'liverpool',
  'chelsea', 'arsenal', 'london', 'orange', 'purple', 'yellow', 'silver',
  'golden', 'cheese', 'tigger', 'pokemon', 'chocolate', 'anthony', 'andrew',
  'joshua', 'amanda', 'justin', 'taylor', 'austin', 'robert', 'monster',
  'samsung', 'iphone', 'google', 'gemini', 'apple', 'diamond', 'asdf1234',
  'qazwsx', 'love123', 'angel', 'lovely', 'maggie', 'pretty', 'peanut',
  'ferrari', 'samantha', 'sophie', 'jasmine', 'melissa', 'winter', 'spring',
  'target', 'corvette', 'phoenix', 'aaa111', 'a123456', '112233', '121212',
  '789456', '159753', '131313', '777777', '666666', '555555', '888888',
  '999999', '101010', '25802580', '147258369', '963852741', 'q1w2e3r4',
  'football1', 'welcome1', 'admin123', 'root', 'toor', 'pass', 'test',
  'guest', 'changeme', 'default', 'letmein1', 'abcd1234', 'temp123',
] as const;

// Common English words and names that show up constantly inside passwords.
// Deliberately compact — this is a demonstration model, not a cracker.
const COMMON_WORDS = [
  'love', 'baby', 'angel', 'happy', 'lucky', 'magic', 'money', 'music',
  'party', 'peace', 'power', 'smile', 'sweet', 'tiger', 'eagle', 'horse',
  'house', 'green', 'black', 'white', 'blue', 'red', 'star', 'moon', 'fire',
  'rock', 'king', 'queen', 'prince', 'girl', 'boy', 'man', 'woman', 'family',
  'friend', 'forever', 'always', 'never', 'crazy', 'super', 'mega', 'ultra',
  'alpha', 'omega', 'delta', 'sigma', 'cyber', 'hacker', 'secure', 'system',
  'network', 'server', 'gaming', 'player', 'winner', 'legend', 'wizard',
  'knight', 'hunter', 'sniper', 'storm', 'thunder', 'lightning', 'winter',
  'summer', 'autumn', 'spring', 'january', 'february', 'march', 'april',
  'may', 'june', 'july', 'august', 'september', 'october', 'november',
  'december', 'monday', 'friday', 'sunday', 'coffee', 'pizza', 'candy',
] as const;

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', '0987654321'];

const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g',
  '7': 't', '8': 'b', '9': 'g', '@': 'a', '$': 's', '!': 'i', '+': 't',
};

const LOG2 = Math.log2;

function leetNormalize(s: string): { text: string; substitutions: number } {
  let subs = 0;
  const text = [...s.toLowerCase()]
    .map((c) => {
      if (LEET_MAP[c]) {
        subs += 1;
        return LEET_MAP[c];
      }
      return c;
    })
    .join('');
  return { text, substitutions: subs };
}

function charPool(pw: string): { size: number; parts: string[] } {
  const parts: string[] = [];
  let size = 0;
  if (/[a-z]/.test(pw)) { size += 26; parts.push('a–z'); }
  if (/[A-Z]/.test(pw)) { size += 26; parts.push('A–Z'); }
  if (/[0-9]/.test(pw)) { size += 10; parts.push('0–9'); }
  if (/[^a-zA-Z0-9]/.test(pw)) { size += 33; parts.push('symbols'); }
  if (/[^\x20-\x7E]/.test(pw)) { size += 100; parts.push('non-ASCII'); }
  return { size: Math.max(size, 1), parts };
}

/** Ascending or descending runs of consecutive codepoints, e.g. "abcd", "9876". */
function findSequences(pw: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const lower = pw.toLowerCase();
  let start = 0;
  let dir = 0;
  for (let i = 1; i <= lower.length; i++) {
    const step = i < lower.length ? lower.charCodeAt(i) - lower.charCodeAt(i - 1) : NaN;
    if (step === dir && (step === 1 || step === -1)) continue;
    const runLen = i - start;
    if ((dir === 1 || dir === -1) && runLen >= 4) {
      hits.push({
        type: 'sequence',
        token: pw.slice(start, i),
        note: `${dir === 1 ? 'ascending' : 'descending'} sequence`,
        span: runLen,
        // Attacker cost: pick a start char and a length — not much more.
        bits: LOG2(94) + LOG2(runLen),
      });
    }
    dir = step === 1 || step === -1 ? step : 0;
    start = dir === 0 ? i : i - 1;
  }
  return hits;
}

/** Same-character runs ("aaa") and whole-string block repeats ("abcabc"). */
function findRepeats(pw: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const runRe = /(.)\1{2,}/g;
  let m: RegExpExecArray | null;
  while ((m = runRe.exec(pw)) !== null) {
    hits.push({
      type: 'repeat',
      token: m[0],
      note: `'${m[1]}' repeated ${m[0].length}×`,
      span: m[0].length,
      bits: LOG2(94) + LOG2(m[0].length),
    });
  }
  for (let unit = 1; unit <= Math.floor(pw.length / 2); unit++) {
    if (pw.length % unit !== 0) continue;
    const block = pw.slice(0, unit);
    if (block.repeat(pw.length / unit) === pw && pw.length / unit >= 2 && unit >= 2) {
      hits.push({
        type: 'repeat',
        token: pw,
        note: `'${block}' repeated ${pw.length / unit}×`,
        span: pw.length,
        bits: unit * LOG2(charPool(block).size) + LOG2(pw.length / unit),
      });
      break;
    }
  }
  return hits;
}

function findKeyboardWalks(pw: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const lower = pw.toLowerCase();
  for (let i = 0; i < lower.length - 3; i++) {
    for (let len = lower.length - i; len >= 4; len--) {
      const frag = lower.slice(i, i + len);
      const onRow = KEYBOARD_ROWS.some(
        (row) => row.includes(frag) || [...row].reverse().join('').includes(frag)
      );
      if (onRow) {
        hits.push({
          type: 'keyboard',
          token: pw.slice(i, i + len),
          note: 'keyboard walk',
          span: len,
          // Start key + direction + length: cheap for a pattern-aware attacker.
          bits: LOG2(47) + 1 + LOG2(len),
        });
        i += len - 1;
        break;
      }
    }
  }
  return hits;
}

function findYears(pw: string): PatternHit[] {
  const hits: PatternHit[] = [];
  const re = /(19\d{2}|20\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pw)) !== null) {
    hits.push({
      type: 'year',
      token: m[0],
      note: 'looks like a year',
      span: 4,
      bits: LOG2(130), // ~130 plausible years
    });
  }
  return hits;
}

function findDictionaryHits(pw: string): PatternHit[] {
  const { text: normalized, substitutions } = leetNormalize(pw);
  type Candidate = { start: number; end: number; hit: PatternHit };
  const candidates: Candidate[] = [];
  const lower = pw.toLowerCase();
  const tryList = (list: readonly string[], listBits: number, kind: 'common' | 'word') => {
    for (const entry of list) {
      if (entry.length < 4) continue;
      // Search the raw password first, then the l33t-normalised form —
      // normalising unconditionally would mangle digit-only entries
      // ("123456" would become "izeasg" and miss the list).
      let idx = lower.indexOf(entry);
      let leetUsed = false;
      if (idx === -1) {
        idx = normalized.indexOf(entry);
        leetUsed = idx !== -1;
      }
      if (idx === -1) continue;
      const original = pw.slice(idx, idx + entry.length);
      candidates.push({
        start: idx,
        end: idx + entry.length,
        hit: {
          type: kind,
          token: original,
          note:
            kind === 'common'
              ? `top-guessed password${leetUsed ? ' (l33t-disguised)' : ''}`
              : `dictionary word${leetUsed ? ' (l33t-disguised)' : ''}`,
          span: entry.length,
          // Cost: index into the list + case variations + leet variations.
          bits: listBits + 1 + (leetUsed ? Math.min(substitutions, 4) : 0),
        },
      });
    }
  };
  tryList(COMMON_PASSWORDS, LOG2(COMMON_PASSWORDS.length), 'common');
  tryList(COMMON_WORDS, LOG2(COMMON_WORDS.length * 40), 'word'); // proxy for a real 10k-word list

  // Longest match wins: drop hits nested inside or overlapping an accepted
  // one, so "pass" doesn't show up alongside "password".
  candidates.sort((a, b) => b.hit.span - a.hit.span);
  const accepted: Candidate[] = [];
  for (const c of candidates) {
    if (accepted.some((a) => c.start < a.end && c.end > a.start)) continue;
    accepted.push(c);
  }
  return accepted.map((c) => c.hit);
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return 'effectively forever';
  if (seconds < 0.001) return 'instantly';
  if (seconds < 1) return 'under a second';
  const units: Array<[number, string]> = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [365, 'day'], [100, 'year'],
  ];
  let value = seconds;
  let name = 'second';
  for (const [div, unit] of units) {
    name = unit;
    if (value < div) break;
    value /= div;
  }
  if (name === 'year' && value >= 100) {
    const centuries = value / 100;
    if (centuries > 1e13) return 'effectively forever (10¹⁵+ years)';
    if (centuries >= 10000) return `${centuries.toExponential(0).replace('e+', ' × 10^')} centuries`;
    return `${Math.round(centuries).toLocaleString('en-GB')} centuries`;
  }
  const rounded = Math.round(value);
  return `${rounded.toLocaleString('en-GB')} ${name}${rounded === 1 ? '' : 's'}`;
}

// Attacker profiles. Rates are order-of-magnitude figures for modern (2026)
// hardware, documented on the page: the point is the *spread*, not precision.
const SCENARIOS: Array<{ label: string; assumption: string; rate: number }> = [
  { label: 'Online, rate-limited', assumption: 'login form with lockouts · ~10 guesses/s', rate: 10 },
  { label: 'Online, no throttling', assumption: 'unprotected API endpoint · ~1k guesses/s', rate: 1e3 },
  { label: 'Offline, slow hash', assumption: 'stolen bcrypt hashes, GPU rig · ~100k guesses/s', rate: 1e5 },
  { label: 'Offline, fast hash', assumption: 'stolen MD5/NTLM hashes, GPU rig · ~1T guesses/s', rate: 1e12 },
];

const VERDICTS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

export function analyzePassword(pw: string): Analysis | null {
  if (!pw) return null;

  const { size: poolSize, parts: poolParts } = charPool(pw);
  const naiveBits = pw.length * LOG2(poolSize);

  // Exact match against the common-password list is a special case: rank
  // decides everything, regardless of naive entropy. Check the raw form
  // first — l33t-normalising digit-only passwords would mangle them.
  const { text: normalized, substitutions } = leetNormalize(pw);
  const lower = pw.toLowerCase();
  let exactRank = COMMON_PASSWORDS.indexOf(lower as (typeof COMMON_PASSWORDS)[number]);
  let exactViaLeet = false;
  if (exactRank === -1 && normalized !== lower) {
    exactRank = COMMON_PASSWORDS.indexOf(normalized as (typeof COMMON_PASSWORDS)[number]);
    exactViaLeet = exactRank !== -1;
  }

  const patterns: PatternHit[] = [];
  let entropyBits: number;

  if (exactRank !== -1) {
    entropyBits = LOG2(exactRank + 2) + 1 + (exactViaLeet ? Math.min(substitutions, 4) : 0);
    patterns.push({
      type: 'common',
      token: pw,
      note: `#${exactRank + 1} most-guessed password${exactViaLeet ? ' (l33t-disguised)' : ''}`,
      span: pw.length,
      bits: entropyBits,
    });
  } else {
    patterns.push(
      ...findDictionaryHits(pw),
      ...findSequences(pw),
      ...findRepeats(pw),
      ...findKeyboardWalks(pw),
      ...findYears(pw)
    );
    // Apply pattern discounts greedily, widest span first, without letting
    // overlapping hits double-dip past the password's length.
    patterns.sort((a, b) => b.span - a.span);
    let adjusted = naiveBits;
    let coveredChars = 0;
    for (const hit of patterns) {
      if (coveredChars + hit.span > pw.length) continue;
      coveredChars += hit.span;
      const naiveForSpan = hit.span * LOG2(poolSize);
      adjusted -= Math.max(0, naiveForSpan - hit.bits);
    }
    entropyBits = Math.max(1, adjusted);
  }

  const verdict =
    entropyBits < 28 ? 0 : entropyBits < 40 ? 1 : entropyBits < 60 ? 2 : entropyBits < 75 ? 3 : 4;

  const avgGuesses = Math.pow(2, entropyBits) / 2;
  const scenarios: CrackScenario[] = SCENARIOS.map((s) => ({
    label: s.label,
    assumption: s.assumption,
    guessesPerSec: s.rate,
    display: formatDuration(avgGuesses / s.rate),
  }));

  const suggestions: string[] = [];
  if (exactRank !== -1) {
    suggestions.push('This is one of the most-guessed passwords on the internet — attackers try it within the first few seconds.');
  }
  if (pw.length < 12) {
    suggestions.push('Length beats complexity: every extra character multiplies the search space. Aim for 14+ characters or a 4-word passphrase.');
  }
  if (patterns.some((p) => p.type === 'word' || p.type === 'common')) {
    suggestions.push('Dictionary words — even with l33t substitutions — are the first thing cracking wordlists cover.');
  }
  if (patterns.some((p) => p.type === 'keyboard')) {
    suggestions.push('Keyboard walks (qwerty, 1qaz2wsx…) are in every cracking ruleset.');
  }
  if (patterns.some((p) => p.type === 'year')) {
    suggestions.push('Years and dates add almost no entropy — there are only ~130 plausible ones.');
  }
  if (poolParts.length === 1 && pw.length < 16) {
    suggestions.push('A single character class shrinks the pool an attacker must search.');
  }
  if (suggestions.length === 0 && verdict >= 3) {
    suggestions.push('Solid. A password manager generating unique 20+ character passwords per site is still the gold standard.');
  }

  return {
    length: pw.length,
    poolSize,
    poolParts,
    naiveBits: Math.round(naiveBits * 10) / 10,
    entropyBits: Math.round(entropyBits * 10) / 10,
    verdict,
    verdictLabel: VERDICTS[verdict],
    patterns,
    suggestions,
    scenarios,
  };
}
