'use client';

import { useMemo, useState } from 'react';
import { decodeCanCapture } from '@/lib/can-decode';

const SAMPLE = `0C9#8A6014000000FFFF
18DAF110#0203AABBCCDD
7DF#02010D
123#R8`;

export default function CanDecoder() {
  const [text, setText] = useState('0C9#8A6014000000FFFF');
  const frames = useMemo(() => decodeCanCapture(text), [text]);
  const ok = frames.filter((f) => !f.error).length;

  return (
    <aside className="panel candec" aria-label="CAN bus frame decoder">
      <div className="panel__head">
        <span>CH-5 · CAN frame decoder</span>
        <b className={ok ? '' : 'muted'}>{ok} frame{ok === 1 ? '' : 's'}</b>
      </div>

      <textarea
        className="iocx__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste CAN frames — e.g. 0C9#8A6014000000FFFF (one per line)"
        spellCheck={false}
        rows={4}
        aria-label="CAN frames to decode"
      />
      <div className="iocx__controls">
        <button className="btn btn--ghost iocx__btn" onClick={() => setText(SAMPLE)}>Load sample</button>
        <button className="btn btn--ghost iocx__btn" onClick={() => setText('')} disabled={!text}>Clear</button>
      </div>

      <div className="candec__frames">
        {frames.map((f, i) => (
          <article className={`candec__frame${f.error ? ' is-error' : ''}`} key={i}>
            {f.error ? (
              <p className="candec__err"><code>{f.raw}</code> — {f.error}</p>
            ) : (
              <>
                <div className="candec__meta">
                  <span className="candec__id">
                    <b>{f.idHex}</b>
                    <span>{f.idDec} · {f.extended ? '29-bit extended' : '11-bit standard'}</span>
                  </span>
                  <span className="candec__tags">
                    <span className="candec__tag">DLC {f.dlc}</span>
                    {f.rtr && <span className="candec__tag candec__tag--warn">RTR</span>}
                    <span className="candec__tag candec__tag--muted">{f.priorityNote}</span>
                  </span>
                </div>
                <div className="candec__idbits">
                  <span>ID bits</span>
                  <code>{f.idBits}</code>
                </div>
                {f.bytes.length > 0 ? (
                  <table className="candec__bytes">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Hex</th>
                        <th>Dec</th>
                        <th>Binary</th>
                        <th>ASCII</th>
                      </tr>
                    </thead>
                    <tbody>
                      {f.bytes.map((b, bi) => (
                        <tr key={bi}>
                          <td>{bi}</td>
                          <td className="candec__hex">{b.hex}</td>
                          <td>{b.dec}</td>
                          <td className="candec__bin">{b.bin}</td>
                          <td className="candec__ascii">{b.ascii}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="candec__nodata">{f.rtr ? 'Remote request — no data field.' : 'No data bytes.'}</p>
                )}
              </>
            )}
          </article>
        ))}
        {frames.length === 0 && <p className="iocx__empty">Paste a frame to decode its structure.</p>}
      </div>

      <p className="panel__source">
        Structure only — payload meaning needs a vehicle-specific DBC. CAN carries no authentication
        or encryption, which is what makes it worth studying. Runs entirely in your browser.
      </p>
    </aside>
  );
}
