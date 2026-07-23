'use client';

import { useMemo, useState } from 'react';
import { inspectUrl, type Severity } from '@/lib/phish-inspect';

const SAMPLES = [
  'https://paypal.com.secure-login.account-verify.ru/signin',
  'http://аpple.com/id/verify',
  'https://www.microsoft.com/en-gb/security',
  'http://192.168.10.5@bit.ly/free-gift',
];

const SEV_LABEL: Record<Severity, string> = { high: 'high', medium: 'medium', low: 'low', info: 'info' };

function verdictClass(score: number): string {
  if (score >= 40) return 'is-bad';
  if (score >= 18) return 'is-warn';
  if (score > 0) return 'is-low';
  return 'is-ok';
}

export default function PhishInspector() {
  const [url, setUrl] = useState('');
  const report = useMemo(() => inspectUrl(url), [url]);
  const a = report.anatomy;

  return (
    <aside className="panel phish" aria-label="Phishing URL inspector">
      <div className="panel__head">
        <span>CH-7 · Phishing URL inspector</span>
        <b className={report.valid ? verdictClass(report.score) : 'muted'}>
          {url.trim() ? report.verdict : '▌standby'}
        </b>
      </div>

      <input
        className="pwlab__input phish__input"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a link to inspect, e.g. https://secure-login.example.com/…"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="URL to inspect"
      />

      <div className="phish__samples">
        <span>Try:</span>
        {SAMPLES.map((s, i) => (
          <button key={i} className="phish__sample" onClick={() => setUrl(s)} title={s}>
            {i === 2 ? 'a legit one' : `example ${i + 1}`}
          </button>
        ))}
      </div>

      {url.trim() && report.valid && a && (
        <>
          <div className="phish__anatomy" aria-label="URL anatomy">
            <span className="phish__anatomy-label">Where this actually goes</span>
            <div className="phish__url">
              <span className="phish__part phish__part--scheme">{a.scheme}://</span>
              {a.userinfo && <span className="phish__part phish__part--bad">{a.userinfo}@</span>}
              {a.subdomain && <span className="phish__part phish__part--sub">{a.subdomain}.</span>}
              <span className="phish__part phish__part--reg">{a.registrable}</span>
              {a.port && <span className="phish__part phish__part--sub">:{a.port}</span>}
              <span className="phish__part phish__part--path">{a.path}</span>
            </div>
            <p className="phish__reg-note">
              Real destination domain: <b>{a.registrable}</b>. Everything else, subdomain, path,
              brand names, is decoration the owner of <b>{a.registrable}</b> controls.
            </p>
          </div>

          <div className="phish__score">
            <div className={`phish__gauge ${verdictClass(report.score)}`}>
              <span className="phish__gauge-fill" style={{ width: `${report.score}%` }} />
            </div>
            <span className="phish__score-num">{report.score}/100</span>
          </div>

          {report.findings.length > 0 ? (
            <ul className="phish__findings">
              {report.findings.map((f, i) => (
                <li key={i} className={`phish__finding sev-${f.severity}`}>
                  <span className="phish__sev">{SEV_LABEL[f.severity]}</span>
                  <span className="phish__finding-body">
                    <b>{f.title}</b>
                    <span>{f.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="phish__clean">No obvious red flags in the structure. Still, verify the domain is one you know.</p>
          )}
        </>
      )}

      {url.trim() && !report.valid && <p className="iocx__empty">{report.verdict}.</p>}

      <p className="panel__source">
        Structural analysis only, the link is never fetched, so redirects and page content can&rsquo;t
        be judged. Runs entirely in your browser.
      </p>
    </aside>
  );
}
