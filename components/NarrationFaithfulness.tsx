'use client';

import { useState } from 'react';
import raw from '@/lib/labs/narration-faithfulness.json';

interface Signal { key: string; label: string; weight: number }
interface Scenario {
  toggled: string | null; signals: Record<string, boolean>; score: number; narration: string;
  mentioned: Record<string, boolean>; confabulated: string[]; omittedDecisive: string[];
}
interface Finding { id: string; host: string; context: string; baseline: Record<string, boolean>; baselineScore: number; scenarios: Record<string, Scenario> }
const DATA = raw as unknown as {
  meta: { status: string; model: string };
  signals: Signal[];
  metrics: { causalTrackingScore: number | null; confabulationRate: number | null; omissionRate: number | null };
  findings: Finding[];
};

const SIGNALS = DATA.signals;
const KEYS = SIGNALS.map((s) => s.key);
const W: Record<string, number> = Object.fromEntries(SIGNALS.map((s) => [s.key, s.weight]));
const LABEL: Record<string, string> = Object.fromEntries(SIGNALS.map((s) => [s.key, s.label]));
const scoreOf = (sig: Record<string, boolean>) => KEYS.reduce((a, k) => a + (sig[k] ? W[k] : 0), 0);
const pct = (x: number | null | undefined) => (x == null ? '—' : `${Math.round(x * 100)}%`);

export default function NarrationFaithfulness() {
  const findings = DATA.findings;
  const [focusId, setFocusId] = useState(findings[0].id);
  const [sig, setSig] = useState<Record<string, boolean>>({ ...findings[0].baseline });

  const focus = findings.find((f) => f.id === focusId) ?? findings[0];
  const setFocus = (id: string) => {
    const f = findings.find((x) => x.id === id)!;
    setFocusId(id);
    setSig({ ...f.baseline });
  };
  const toggle = (k: string) => setSig((p) => ({ ...p, [k]: !p[k] }));

  // Which recorded scenario matches the current focus signal-state?
  const diffs = KEYS.filter((k) => !!sig[k] !== !!focus.baseline[k]);
  const scenario: Scenario | null =
    diffs.length === 0 ? focus.scenarios.baseline : diffs.length === 1 ? focus.scenarios[`toggle:${diffs[0]}`] : null;

  // Live ranking: the focus finding uses the toggled signals, others their baseline.
  const ranked = findings
    .map((f) => ({ f, score: f.id === focusId ? scoreOf(sig) : f.baselineScore }))
    .sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...ranked.map((r) => r.score), 1);
  const m = DATA.metrics;

  return (
    <div className="ucot">
      {DATA.meta.status !== 'recorded' && <p className="ucot__sample">Sample data, awaiting the real generation run.</p>}

      <div className="ucot__metrics">
        <div className="ucot__metric ucot__metric--punch"><b>{pct(m.causalTrackingScore)}</b><span>the explanation changes when the true cause changes</span></div>
        <div className="ucot__metric"><b>{pct(m.confabulationRate)}</b><span>cite a signal that did not fire (confabulation)</span></div>
        <div className="ucot__metric"><b>{pct(m.omissionRate)}</b><span>drop a decisive signal that did fire (omission)</span></div>
      </div>

      <p className="nf__intro">
        The ranking below is computed by <b>deterministic code</b> (a weighted sum of the signals), so
        the true cause of every position is known exactly. The LLM only writes the explanation. Toggle
        the focus host&rsquo;s signals: the ranking recomputes live, and its recorded explanation updates
        beside it. Because the answer key is held, you can grade the explanation instead of trusting it.
      </p>

      <div className="ucot__grid">
        {/* ranking */}
        <div className="ucot__panel">
          <div className="ucot__panel-head"><span className="ucot__panel-title">Deterministic ranking</span><span className="ucot__panel-sub">computed live in your browser</span></div>
          <ol className="nf__rank">
            {ranked.map(({ f, score }, i) => (
              <li key={f.id}>
                <button type="button" className={f.id === focusId ? 'nf__rowbtn is-focus' : 'nf__rowbtn'} onClick={() => setFocus(f.id)}>
                  <span className="nf__rank-n">{i + 1}</span>
                  <span className="nf__host">{f.host}</span>
                  <span className="nf__bar"><span style={{ width: `${(score / maxScore) * 100}%` }} /></span>
                  <span className="nf__score">{score}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* focus: toggles + narration + analysis */}
        <div className="ucot__panel">
          <div className="ucot__panel-head"><span className="ucot__panel-title">{focus.host}</span><span className="ucot__panel-sub">{focus.context}. Toggle the signals that fire:</span></div>
          <div className="nf__toggles">
            {KEYS.map((k) => (
              <label key={k} className={sig[k] ? 'nf__toggle is-on' : 'nf__toggle'}>
                <input type="checkbox" checked={!!sig[k]} onChange={() => toggle(k)} />
                <span>{LABEL[k]}</span>
                <span className="nf__w">+{W[k]}</span>
              </label>
            ))}
          </div>

          {scenario ? (
            <>
              <p className="nf__narration">{scenario.narration}</p>
              <ul className="nf__analysis">
                {KEYS.map((k) => {
                  const fired = !!scenario.signals[k];
                  const mentioned = !!scenario.mentioned[k];
                  const confab = !fired && mentioned;
                  const omit = scenario.omittedDecisive.includes(k);
                  if (!fired && !mentioned) return null;
                  return (
                    <li key={k} className="nf__arow">
                      <span className={fired ? 'nf__dot nf__dot--on' : 'nf__dot'} title={fired ? 'signal fired' : 'did not fire'} />
                      <span className="nf__aname">{LABEL[k]}</span>
                      <span className="nf__astate">
                        {fired ? 'fired' : 'did not fire'} · {mentioned ? 'mentioned' : 'not mentioned'}
                      </span>
                      {confab && <span className="ucot__tag ucot__tag--pick" style={{ color: '#7d2620', borderColor: '#E4B7B1' }}>confabulated</span>}
                      {omit && <span className="ucot__tag" style={{ color: '#8a5a00', border: '1px solid #E4C88a' }}>omitted</span>}
                      {fired && mentioned && !omit && <span className="ucot__tag ucot__tag--correct">tracked</span>}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="nf__note">Narration is recorded for the baseline and single-signal changes. Toggle back so exactly one signal differs from the default to see the explanation.</p>
          )}
        </div>
      </div>

      <p className="ucot__read">
        Change a signal and watch the explanation follow it, every time (that is the 100% tracking).
        Turn a fired signal off and the narration stops citing it; it never keeps a cause that is no
        longer there, and it never invents one. That faithfulness is real, but it is bought by the
        structure: the cause was explicit and handed over. CH-8 and CH-9 show what the same model does
        when the cause is hidden or the reasoning is its own.
      </p>
    </div>
  );
}
