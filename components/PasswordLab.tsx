'use client';

import { useMemo, useState } from 'react';
import { analyzePassword } from '@/lib/password-analysis';

type HibpState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'clean' }
  | { status: 'pwned'; count: number }
  | { status: 'error' };

/**
 * Checks the password against Have I Been Pwned using k-anonymity: the
 * password is SHA-1 hashed locally and only the FIRST FIVE hex characters of
 * the hash are sent; HIBP returns every suffix in that bucket (~800 of them)
 * and the match is found locally. The password itself never leaves the page.
 */
async function checkHibp(password: string): Promise<HibpState> {
  try {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-1', data);
    const hex = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const prefix = hex.slice(0, 5);
    const suffix = hex.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    if (!res.ok) return { status: 'error' };
    const body = await res.text();
    for (const line of body.split('\n')) {
      const [candidate, count] = line.trim().split(':');
      if (candidate === suffix) {
        const n = parseInt(count, 10);
        if (n > 0) return { status: 'pwned', count: n };
      }
    }
    return { status: 'clean' };
  } catch {
    return { status: 'error' };
  }
}

export default function PasswordLab() {
  const [pw, setPw] = useState('');
  const [visible, setVisible] = useState(false);
  const [hibp, setHibp] = useState<HibpState>({ status: 'idle' });

  const analysis = useMemo(() => analyzePassword(pw), [pw]);

  const onInput = (value: string) => {
    setPw(value);
    setHibp({ status: 'idle' });
  };

  const runHibp = async () => {
    if (!pw) return;
    setHibp({ status: 'checking' });
    setHibp(await checkHibp(pw));
  };

  return (
    <aside className="panel pwlab" aria-label="Password strength analyser">
      <div className="panel__head">
        <span>CH-2 · Password strength</span>
        <b className={analysis && analysis.verdict <= 1 ? 'alert' : ''}>
          {analysis ? `▌${analysis.verdictLabel.toUpperCase()}` : '▌STANDBY'}
        </b>
      </div>

      <div className="pwlab__input-row">
        <input
          className="pwlab__input"
          type={visible ? 'text' : 'password'}
          value={pw}
          onChange={(e) => onInput(e.target.value)}
          placeholder="Type a password to analyse…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Password to analyse"
        />
        <button
          type="button"
          className="pwlab__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      <div
        className={`pwlab__meter${analysis ? ` pwlab__meter--v${analysis.verdict}` : ''}`}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={analysis?.verdict ?? 0}
        aria-label="Password strength"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={analysis && i <= analysis.verdict ? 'on' : ''} />
        ))}
      </div>

      <div className="panel__readouts">
        <div>
          Guess entropy
          <b>{analysis ? `${analysis.entropyBits} bits` : '—'}</b>
        </div>
        <div>
          Charset pool
          <b>{analysis ? analysis.poolSize : '—'}</b>
        </div>
        <div>
          Length
          <b>{analysis ? analysis.length : '—'}</b>
        </div>
      </div>

      {analysis && analysis.patterns.length > 0 && (
        <div className="pwlab__section" aria-live="polite">
          <span className="pwlab__label">Patterns detected</span>
          <ul className="pwlab__patterns">
            {analysis.patterns.map((p, i) => (
              <li key={i}>
                <code>{p.token}</code> <span>{p.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pwlab__section">
        <span className="pwlab__label">Time to crack (average)</span>
        <table className="pwlab__times">
          <tbody>
            {(analysis?.scenarios ?? []).map((s) => (
              <tr key={s.label}>
                <td>
                  {s.label}
                  <small>{s.assumption}</small>
                </td>
                <td>{s.display}</td>
              </tr>
            ))}
            {!analysis && (
              <tr>
                <td>
                  Awaiting input
                  <small>the analysis runs locally as you type</small>
                </td>
                <td>—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {analysis && analysis.suggestions.length > 0 && (
        <div className="pwlab__section">
          <span className="pwlab__label">Advice</span>
          <ul className="pwlab__advice">
            {analysis.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pwlab__section pwlab__hibp">
        <button
          type="button"
          className="btn btn--ghost pwlab__hibp-btn"
          onClick={runHibp}
          disabled={!pw || hibp.status === 'checking'}
        >
          {hibp.status === 'checking' ? 'Checking…' : 'Check breach exposure ↗'}
        </button>
        <span className="pwlab__hibp-result" role="status">
          {hibp.status === 'pwned' && (
            <b className="bad">Seen {hibp.count.toLocaleString('en-GB')}× in known breaches, do not use.</b>
          )}
          {hibp.status === 'clean' && <b className="good">Not found in known breach corpora.</b>}
          {hibp.status === 'error' && 'Lookup failed, try again.'}
          {hibp.status === 'idle' &&
            'Optional: k-anonymity lookup against Have I Been Pwned. Only the first 5 characters of a local SHA-1 hash are sent, never the password.'}
        </span>
      </div>

      <p className="panel__source">
        Runs entirely in your browser, nothing you type is transmitted or stored.
      </p>
    </aside>
  );
}
