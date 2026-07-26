'use client';

import { useState } from 'react';
import raw from '@/lib/labs/cot-loadbearing.json';

const LETTERS = ['A', 'B', 'C', 'D'];
type Pert = 'corrupt' | 'truncate' | 'filler' | 'paraphrase';

interface PerStep { step: number; corruptedText: string; answer: number; flipped: boolean }
interface Trunc { k: number; keptSteps: number; answer: number; flipped: boolean; correct: boolean }
interface Item {
  id: string; task: string; difficulty: string; question: string; options: string[]; correct: number;
  baseline: { answer: number; steps: string[]; cot: string; correct: boolean };
  truncate: Trunc[];
  corrupt: { perStep: PerStep[]; anyFlip: boolean };
  filler: { fillerText: string; answer: number; flipped: boolean; correct: boolean };
  paraphrase: { steps: string[]; equivalent: boolean; answer: number; flipped: boolean; correct: boolean };
}
const DATA = raw as unknown as {
  meta: { status: string; model: string; nQuestions: number };
  metrics: { corruptFlipRate: number | null; fillerAccuracy: number | null; paraphraseFlipRate: number | null; baselineAccuracy: number | null };
  items: Item[];
};

const PERT: Record<Pert, string> = { corrupt: 'Corrupt a step', truncate: 'Truncate', filler: 'Filler', paraphrase: 'Paraphrase' };
const pct = (x: number | null | undefined) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const letter = (i: number) => (i >= 0 && i < 4 ? LETTERS[i] : '?');

function Steps({ steps, corruptIndex, corruptText, keep }: { steps: string[]; corruptIndex?: number; corruptText?: string; keep?: number }) {
  return (
    <ol className="lb__steps">
      {steps.map((s, i) => {
        const dropped = keep != null && i >= keep;
        const corrupt = corruptIndex === i;
        return (
          <li key={i} className={['lb__step', dropped ? 'lb__step--dropped' : '', corrupt ? 'lb__step--corrupt' : ''].filter(Boolean).join(' ')}>
            <span className="lb__step-n">{i + 1}</span>
            <span>{corrupt && corruptText ? corruptText : s}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function LoadBearingCoT() {
  const items = DATA.items;
  const [qid, setQid] = useState(items[0].id);
  const [pert, setPert] = useState<Pert>('corrupt');
  const [step, setStep] = useState(0);

  const item = items.find((i) => i.id === qid) ?? items[0];
  const base = item.baseline;
  const m = DATA.metrics;

  let perturbedSteps: React.ReactNode;
  let perturbedAnswer: number;
  let flipped: boolean;
  let sub: string;
  let chips: React.ReactNode = null;

  if (pert === 'corrupt') {
    const idx = Math.min(step, item.corrupt.perStep.length - 1);
    const ps = item.corrupt.perStep[idx];
    perturbedAnswer = ps.answer; flipped = ps.flipped;
    perturbedSteps = <Steps steps={base.steps} corruptIndex={ps.step - 1} corruptText={ps.corruptedText} />;
    sub = `Step ${ps.step} broken (a wrong number inserted), then the model continues from there.`;
    chips = (
      <div className="lb__chips" role="group" aria-label="Per-step sensitivity">
        <span className="lb__chips-label">break step:</span>
        {item.corrupt.perStep.map((p, i) => (
          <button key={i} type="button" className={['lb__chip', i === idx ? 'is-active' : '', p.flipped ? 'lb__chip--flip' : ''].filter(Boolean).join(' ')} onClick={() => setStep(i)}>
            {p.step}{p.flipped ? ' ⚑' : ''}
          </button>
        ))}
      </div>
    );
  } else if (pert === 'truncate') {
    const t = item.truncate[item.truncate.length - 1];
    perturbedAnswer = t.answer; flipped = t.flipped;
    perturbedSteps = <Steps steps={base.steps} keep={t.keptSteps} />;
    sub = `Kept only the first ${t.keptSteps} of ${base.steps.length} steps, then forced an answer.`;
  } else if (pert === 'filler') {
    perturbedAnswer = item.filler.answer; flipped = item.filler.flipped;
    perturbedSteps = <p className="lb__filler">{item.filler.fillerText}</p>;
    sub = 'The whole chain replaced with meaningless tokens of matched length.';
  } else {
    perturbedAnswer = item.paraphrase.answer; flipped = item.paraphrase.flipped;
    perturbedSteps = <Steps steps={item.paraphrase.steps} />;
    sub = `Every step restated, meaning preserved. Judge says: ${item.paraphrase.equivalent ? 'equivalent.' : 'not equivalent.'}`;
  }

  return (
    <div className="ucot">
      {DATA.meta.status !== 'recorded' && <p className="ucot__sample">Sample data — awaiting the real generation run.</p>}

      <div className="ucot__metrics">
        <div className="ucot__metric">
          <b>{pct(m.corruptFlipRate)}</b>
          <span>of broken steps change the answer — high means the reasoning is load-bearing</span>
        </div>
        <div className="ucot__metric ucot__metric--punch">
          <b>{pct(m.fillerAccuracy)}</b>
          <span>still correct with the reasoning replaced by nonsense — high means it was decorative</span>
        </div>
        <div className="ucot__metric">
          <b>{pct(m.paraphraseFlipRate)}</b>
          <span>change under a meaning-preserving rewrite — the control, should be low</span>
        </div>
      </div>

      <div className="ucot__controls">
        <label className="ucot__pick">
          <span>Question</span>
          <select value={qid} onChange={(e) => { setQid(e.target.value); setStep(0); }}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>{it.id.toUpperCase()} · {it.difficulty} · {it.task} — {it.question.slice(0, 44)}…</option>
            ))}
          </select>
        </label>
        <div className="ucot__bias" role="group" aria-label="Perturbation">
          {(['corrupt', 'truncate', 'filler', 'paraphrase'] as Pert[]).map((p) => (
            <button key={p} type="button" className={p === pert ? 'is-active' : ''} onClick={() => { setPert(p); setStep(0); }}>{PERT[p]}</button>
          ))}
        </div>
      </div>

      <p className="ucot__q">{item.question}</p>

      <div className="ucot__grid">
        <div className="ucot__panel">
          <div className="ucot__panel-head">
            <span className="ucot__panel-title">Original chain</span>
            <span className="ucot__panel-sub">the model&rsquo;s own reasoning</span>
          </div>
          <Steps steps={base.steps} />
          <div className="ucot__verdict"><span className="ucot__ok">Answer ({letter(base.answer)}) — correct</span></div>
        </div>
        <div className="ucot__panel">
          <div className="ucot__panel-head">
            <span className="ucot__panel-title">Perturbed · {PERT[pert]}</span>
            <span className="ucot__panel-sub">{sub}</span>
          </div>
          {chips}
          {perturbedSteps}
          <div className="ucot__verdict">
            <span className={flipped ? 'ucot__bad' : 'ucot__ok'}>
              Answer ({letter(perturbedAnswer)}) —{' '}
              {flipped ? <><b>changed</b> (the reasoning mattered)</> : <><b>unchanged</b> (the answer ignored the reasoning)</>}
            </span>
          </div>
        </div>
      </div>

      <p className="ucot__read">
        {item.corrupt.anyFlip
          ? 'On this question, breaking a step can move the answer, so some of the chain is load-bearing. The ⚑ marks which steps.'
          : 'Corrupt any step, drop the later ones, or swap the whole chain for filler: the answer does not move. For this question the stated reasoning is decoration; the answer was decided elsewhere. Read the caveat below, though: the task is also easy enough that the model may simply not need the steps.'}
      </p>
    </div>
  );
}
