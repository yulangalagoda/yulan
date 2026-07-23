'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  decodeJwt,
  fromBase64,
  looksLikeJwt,
  toBase64,
  toHex,
  urlDecode,
  urlEncode,
} from '@/lib/encoding-tools';

async function sha(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function Row({ label, value, mono = true }: { label: string; value: string | null; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="wb__row">
      <span className="wb__row-label">{label}</span>
      <code className={`wb__row-val${mono ? '' : ' wb__row-val--plain'}${value ? '' : ' is-empty'}`}>
        {value || '—'}
      </code>
      <button className="wb__copy" onClick={copy} disabled={!value} aria-label={`Copy ${label}`}>
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );
}

export default function Workbench() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<{ s1: string; s256: string; s512: string } | null>(null);

  const encodings = useMemo(
    () => ({
      base64: text ? toBase64(text) : null,
      base64Decoded: text ? fromBase64(text) : null,
      hex: text ? toHex(text) : null,
      urlEnc: text ? urlEncode(text) : null,
      urlDec: text ? urlDecode(text) : null,
    }),
    [text]
  );

  const jwt = useMemo(() => (looksLikeJwt(text) ? decodeJwt(text) : null), [text]);

  useEffect(() => {
    let cancelled = false;
    if (!text) {
      setHashes(null);
      return;
    }
    Promise.all([sha('SHA-1', text), sha('SHA-256', text), sha('SHA-512', text)]).then(
      ([s1, s256, s512]) => {
        if (!cancelled) setHashes({ s1, s256, s512 });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <aside className="panel wb" aria-label="Hash and encoding workbench">
      <div className="panel__head">
        <span>CH-6 · Hash &amp; encoding workbench</span>
        <b className={jwt ? '' : 'muted'}>{jwt ? 'JWT detected' : 'text in'}</b>
      </div>

      <textarea
        className="iocx__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text, a Base64 string, or a JWT…"
        spellCheck={false}
        rows={4}
        aria-label="Input to transform"
      />

      {jwt && (
        <div className="wb__jwt">
          <span className="wb__jwt-label">JWT decoded {jwt.error ? '· error' : '· signature not verified'}</span>
          {jwt.error ? (
            <p className="wb__jwt-err">{jwt.error}</p>
          ) : (
            <>
              <pre className="wb__jwt-block"><b>header</b>{'\n'}{JSON.stringify(jwt.header, null, 2)}</pre>
              <pre className="wb__jwt-block"><b>payload</b>{'\n'}{JSON.stringify(jwt.payload, null, 2)}</pre>
              {jwt.claimNotes.length > 0 && (
                <ul className="wb__jwt-claims">
                  {jwt.claimNotes.map((c, i) => (
                    <li key={i} className={/EXPIRED/.test(c) ? 'is-bad' : ''}>{c}</li>
                  ))}
                </ul>
              )}
              <p className="wb__jwt-note">
                Decoding only, anyone can read a JWT&rsquo;s payload; it is signed, not encrypted.
                Verifying the signature needs the secret or public key.
              </p>
            </>
          )}
        </div>
      )}

      <div className="wb__section">
        <span className="wb__section-label">Encodings</span>
        <Row label="Base64" value={encodings.base64} />
        <Row label="Base64 → text" value={encodings.base64Decoded} mono={false} />
        <Row label="Hex" value={encodings.hex} />
        <Row label="URL-encoded" value={encodings.urlEnc} />
        <Row label="URL → text" value={encodings.urlDec} mono={false} />
      </div>

      <div className="wb__section">
        <span className="wb__section-label">Hashes (of the UTF-8 text)</span>
        <Row label="SHA-1" value={hashes?.s1 ?? null} />
        <Row label="SHA-256" value={hashes?.s256 ?? null} />
        <Row label="SHA-512" value={hashes?.s512 ?? null} />
      </div>

      <p className="panel__source">
        WebCrypto digests and encoding all run locally, nothing you type is transmitted or stored.
      </p>
    </aside>
  );
}
