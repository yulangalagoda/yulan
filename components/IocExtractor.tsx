'use client';

import { useMemo, useState } from 'react';
import { defang, extractIocs, toCsv, toPlain, type IocType } from '@/lib/ioc-extract';

const SAMPLE = `Received: from mail.evil-c2[.]net (185.220.101[.]47)
Suspicious login from 45.155.205.233 and internal host 192.168.1.14.
Payload fetched from hxxps://cdn.malware-drop[.]xyz/loader.exe
Dropper SHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
Also seen: 44d88612fea8a8f36de82e1278abb02f (md5)
Exploited CVE-2024-3094 in the build pipeline.
Contact: attacker@evil-c2[.]net`;

const HINT: Record<IocType, string> = {
  url: 'links',
  domain: 'hostnames',
  ipv4: 'IPv4',
  ipv6: 'IPv6',
  email: 'addresses',
  sha256: 'SHA-256',
  sha1: 'SHA-1',
  md5: 'MD5',
  cve: 'vulns',
};

export default function IocExtractor() {
  const [text, setText] = useState('');
  const [defanged, setDefanged] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const result = useMemo(() => extractIocs(text), [text]);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <aside className="panel iocx" aria-label="Indicator-of-compromise extractor">
      <div className="panel__head">
        <span>CH-4 · IOC extractor</span>
        <b className={result.total ? '' : 'muted'}>{result.total} indicator{result.total === 1 ? '' : 's'}</b>
      </div>

      <textarea
        className="iocx__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a log line, raw email, or threat-intel blob…"
        spellCheck={false}
        rows={7}
        aria-label="Text to extract indicators from"
      />

      <div className="iocx__controls">
        <button className="btn btn--ghost iocx__btn" onClick={() => setText(SAMPLE)}>Load sample</button>
        <button className="btn btn--ghost iocx__btn" onClick={() => setText('')} disabled={!text}>Clear</button>
        <label className="iocx__toggle">
          <input type="checkbox" checked={defanged} onChange={(e) => setDefanged(e.target.checked)} />
          Defang output
        </label>
        <span className="iocx__spacer" />
        <button
          className="btn btn--ghost iocx__btn"
          onClick={() => copy(toPlain(result, defanged), 'all-txt')}
          disabled={!result.total}
        >
          {copied === 'all-txt' ? 'Copied' : 'Copy all'}
        </button>
        <button
          className="btn btn--ghost iocx__btn"
          onClick={() => copy(toCsv(result, defanged), 'all-csv')}
          disabled={!result.total}
        >
          {copied === 'all-csv' ? 'Copied' : 'CSV'}
        </button>
      </div>

      {result.total === 0 ? (
        <p className="iocx__empty">
          {text.trim()
            ? 'No indicators found in that text.'
            : 'Nothing extracted yet, paste some text or load the sample.'}
        </p>
      ) : (
        <div className="iocx__groups">
          {result.groups.map((g) => (
            <section className="iocx__group" key={g.type}>
              <header className="iocx__group-head">
                <span className="iocx__group-label">
                  {g.label} <em>{HINT[g.type]}</em>
                </span>
                <span className="iocx__group-count">{g.items.length}</span>
                <button
                  className="iocx__copy"
                  onClick={() =>
                    copy(g.items.map((it) => (defanged ? defang(it.value, g.type) : it.value)).join('\n'), g.type)
                  }
                  aria-label={`Copy ${g.label}`}
                >
                  {copied === g.type ? 'copied' : 'copy'}
                </button>
              </header>
              <ul className="iocx__list">
                {g.items.map((it, i) => (
                  <li key={i}>
                    <code>{defanged ? defang(it.value, g.type) : it.value}</code>
                    {it.note && <span className="iocx__note">{it.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="panel__source">
        Defanging and de-duplication run entirely in your browser, nothing you paste is transmitted
        or stored.
      </p>
    </aside>
  );
}
