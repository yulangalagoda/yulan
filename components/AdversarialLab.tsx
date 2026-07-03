'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdversarialModel,
  loadModel,
  type AttackResult,
  type Forward,
} from '@/lib/adversarial-model';

type Method = 'fgsm' | 'pgd';
type Mode = 'gallery' | 'draw';

const DISPLAY = 112; // px for each 28×28 panel
const DRAW = 252; // px drawing surface

// Render a 28×28 [0,1] intensity image (white digit on black) to a canvas.
function paintDigit(canvas: HTMLCanvasElement | null, px: Float32Array) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = ctx.createImageData(28, 28);
  for (let i = 0; i < 784; i++) {
    const v = Math.round(px[i] * 255);
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = 28;
  tmp.height = 28;
  tmp.getContext('2d')!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
}

// Render a signed perturbation as a diverging heatmap (red = pixel brightened,
// blue = darkened), amplified so tiny changes are visible.
function paintPerturbation(canvas: HTMLCanvasElement | null, pert: Float32Array) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let max = 1e-6;
  for (let i = 0; i < pert.length; i++) max = Math.max(max, Math.abs(pert[i]));
  const img = ctx.createImageData(28, 28);
  for (let i = 0; i < 784; i++) {
    const t = pert[i] / max; // −1..1
    let r: number;
    let g: number;
    let b: number;
    if (t >= 0) {
      r = 20 + 200 * t;
      g = 30 + 40 * (1 - t);
      b = 40 * (1 - t);
    } else {
      const s = -t;
      r = 30 * (1 - s);
      g = 60 + 80 * (1 - s);
      b = 40 + 200 * s;
    }
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = 28;
  tmp.height = 28;
  tmp.getContext('2d')!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
}

// Turn a free-hand drawing into an MNIST-style 28×28 input: threshold the ink,
// crop to its bounding box, scale the long side to 20px, and recentre by centre
// of mass into a 28×28 field — the same normalisation the dataset uses.
function drawingToInput(source: HTMLCanvasElement): Float32Array | null {
  const ctx = source.getContext('2d')!;
  const { width: W, height: H } = source;
  const data = ctx.getImageData(0, 0, W, H).data;
  // Downsample intensity (ink is white on black) to a coarse grid first.
  const S = 28;
  const cell = new Float32Array(S * S);
  const sx = W / S;
  const sy = H / S;
  let any = false;
  for (let gy = 0; gy < S; gy++) {
    for (let gx = 0; gx < S; gx++) {
      let sum = 0;
      let n = 0;
      for (let y = Math.floor(gy * sy); y < (gy + 1) * sy; y++) {
        for (let x = Math.floor(gx * sx); x < (gx + 1) * sx; x++) {
          sum += data[(y * W + x) * 4]; // red channel; grayscale ink
          n++;
        }
      }
      const v = n ? sum / n / 255 : 0;
      cell[gy * S + gx] = v;
      if (v > 0.05) any = true;
    }
  }
  if (!any) return null;

  // Bounding box of the ink.
  let minX = S;
  let minY = S;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (cell[y * S + x] > 0.05) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const scale = 20 / Math.max(bw, bh);

  // Scale the cropped glyph into a 20-ish box, tracking centre of mass.
  const out = new Float32Array(S * S);
  let massX = 0;
  let massY = 0;
  let mass = 0;
  const placed: Array<[number, number, number]> = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const v = cell[y * S + x];
      if (v <= 0.01) continue;
      const nx = (x - minX) * scale;
      const ny = (y - minY) * scale;
      placed.push([nx, ny, v]);
      massX += nx * v;
      massY += ny * v;
      mass += v;
    }
  }
  const comX = mass ? massX / mass : 10;
  const comY = mass ? massY / mass : 10;
  const offX = Math.round(14 - comX);
  const offY = Math.round(14 - comY);
  for (const [nx, ny, v] of placed) {
    const px = Math.round(nx) + offX;
    const py = Math.round(ny) + offY;
    if (px < 0 || px >= S || py < 0 || py >= S) continue;
    out[py * S + px] = Math.min(1, out[py * S + px] + v);
  }
  return out;
}

function ConfidenceBars({ forward, highlight }: { forward: Forward | null; highlight?: number }) {
  return (
    <div className="advlab__bars">
      {Array.from({ length: 10 }, (_, d) => {
        const p = forward ? forward.probs[d] : 0;
        const isPred = forward?.pred === d;
        return (
          <div key={d} className={`advlab__bar${isPred ? ' is-pred' : ''}${highlight === d ? ' is-true' : ''}`}>
            <span className="advlab__bar-label">{d}</span>
            <span className="advlab__bar-track">
              <span className="advlab__bar-fill" style={{ width: `${Math.round(p * 100)}%` }} />
            </span>
            <span className="advlab__bar-val">{forward ? `${Math.round(p * 100)}%` : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdversarialLab() {
  const [model, setModel] = useState<AdversarialModel | null>(null);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>('gallery');
  const [method, setMethod] = useState<Method>('fgsm');
  const [epsilon, setEpsilon] = useState(0.12);
  const [input, setInput] = useState<Float32Array | null>(null);
  const [trueLabel, setTrueLabel] = useState<number | null>(null);
  const [result, setResult] = useState<AttackResult | null>(null);

  const drawRef = useRef<HTMLCanvasElement | null>(null);
  const origRef = useRef<HTMLCanvasElement | null>(null);
  const pertRef = useRef<HTMLCanvasElement | null>(null);
  const advRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadModel().then(setModel).catch(() => setError(true));
  }, []);

  // Load the first gallery sample once the model is ready.
  useEffect(() => {
    if (model && !input && model.samples.length) {
      const s = model.samples[0];
      setInput(s.pixels);
      setTrueLabel(s.label);
    }
  }, [model, input]);

  // Recompute the attack whenever the input, ε, or method changes.
  useEffect(() => {
    if (!model || !input || trueLabel === null) return;
    const res =
      method === 'fgsm'
        ? model.fgsm(input, epsilon, trueLabel)
        : model.pgd(input, epsilon, trueLabel);
    setResult(res);
  }, [model, input, trueLabel, epsilon, method]);

  // Keep the three panels painted in sync with the current result.
  useEffect(() => {
    if (!input) return;
    paintDigit(origRef.current, input);
    if (result) {
      paintPerturbation(pertRef.current, result.perturbation);
      paintDigit(advRef.current, result.adversarial);
    }
  }, [input, result]);

  const clearDraw = useCallback(() => {
    const c = drawRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  // Initialise / reset the drawing surface when entering draw mode.
  useEffect(() => {
    if (mode === 'draw') clearDraw();
  }, [mode, clearDraw]);

  const pointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = drawRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * c.width, y: ((e.clientY - rect.top) / rect.height) * c.height };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    lastPt.current = pointer(e);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = drawRef.current!;
    const ctx = c.getContext('2d')!;
    const pt = pointer(e);
    const prev = lastPt.current ?? pt;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = c.width * 0.09;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPt.current = pt;
  };
  const onUp = () => {
    drawing.current = false;
    lastPt.current = null;
  };

  const classifyDrawing = () => {
    if (!model || !drawRef.current) return;
    const px = drawingToInput(drawRef.current);
    if (!px) return;
    const clean = model.forward(px);
    setInput(px);
    setTrueLabel(clean.pred); // untargeted: attack away from the model's own call
  };

  const pickSample = (i: number) => {
    if (!model) return;
    const s = model.samples[i];
    setInput(s.pixels);
    setTrueLabel(s.label);
  };

  if (error) {
    return (
      <aside className="panel advlab" aria-label="Adversarial examples playground">
        <div className="panel__head">
          <span>CH-3 · Adversarial examples</span>
          <b className="alert">▌MODEL OFFLINE</b>
        </div>
        <p className="advlab__loading">Couldn&rsquo;t load the model in this browser.</p>
      </aside>
    );
  }

  return (
    <aside className="panel advlab" aria-label="Adversarial examples playground">
      <div className="panel__head">
        <span>CH-3 · Adversarial examples</span>
        <b className={result?.flipped ? 'alert' : ''}>
          {!model ? '▌LOADING' : result?.flipped ? '▌EVASION' : '▌ROBUST'}
        </b>
      </div>

      <div className="advlab__modes" role="tablist" aria-label="Input source">
        <button role="tab" aria-selected={mode === 'gallery'} className={mode === 'gallery' ? 'on' : ''} onClick={() => setMode('gallery')}>
          Gallery
        </button>
        <button role="tab" aria-selected={mode === 'draw'} className={mode === 'draw' ? 'on' : ''} onClick={() => setMode('draw')}>
          Draw
        </button>
      </div>

      {mode === 'gallery' ? (
        <div className="advlab__gallery" aria-label="Sample digits">
          {model?.samples.map((s, i) => (
            <button
              key={i}
              className={`advlab__thumb${input === s.pixels ? ' on' : ''}`}
              onClick={() => pickSample(i)}
              aria-label={`Digit ${s.label}`}
            >
              <SampleThumb pixels={s.pixels} />
            </button>
          ))}
          {!model && <p className="advlab__loading">Loading model…</p>}
        </div>
      ) : (
        <div className="advlab__draw">
          <canvas
            ref={drawRef}
            width={DRAW}
            height={DRAW}
            className="advlab__canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
          <div className="advlab__draw-actions">
            <button className="btn btn--primary" onClick={classifyDrawing} disabled={!model}>
              Classify &amp; attack
            </button>
            <button className="btn btn--ghost" onClick={clearDraw}>Clear</button>
          </div>
          <p className="advlab__hint">Draw a single digit (0–9), big and centred.</p>
        </div>
      )}

      <div className="advlab__stage">
        <figure className="advlab__panel">
          <canvas ref={origRef} width={DISPLAY} height={DISPLAY} />
          <figcaption>
            Input
            <b>{result ? `“${result.original.pred}” · ${Math.round(result.original.conf * 100)}%` : '—'}</b>
          </figcaption>
        </figure>
        <div className="advlab__op">+</div>
        <figure className="advlab__panel">
          <canvas ref={pertRef} width={DISPLAY} height={DISPLAY} />
          <figcaption>
            Perturbation
            <b>ε = {epsilon.toFixed(2)}</b>
          </figcaption>
        </figure>
        <div className="advlab__op">=</div>
        <figure className={`advlab__panel${result?.flipped ? ' is-flipped' : ''}`}>
          <canvas ref={advRef} width={DISPLAY} height={DISPLAY} />
          <figcaption>
            Adversarial
            <b>
              {result ? `“${result.adversarialForward.pred}” · ${Math.round(result.adversarialForward.conf * 100)}%` : '—'}
            </b>
          </figcaption>
        </figure>
      </div>

      <div className="advlab__verdict" aria-live="polite">
        {result?.flipped ? (
          <span className="advlab__verdict-bad">
            Fooled: the model now reads <b>{result.adversarialForward.pred}</b> instead of{' '}
            <b>{result.original.pred}</b> — yet the image looks unchanged.
          </span>
        ) : (
          <span className="advlab__verdict-ok">
            Still correct at ε = {epsilon.toFixed(2)}. Raise ε until the prediction breaks.
          </span>
        )}
      </div>

      <div className="advlab__controls">
        <label className="advlab__slider">
          <span>Attack strength · ε {epsilon.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
          />
        </label>
        <div className="advlab__method" role="group" aria-label="Attack method">
          <button className={method === 'fgsm' ? 'on' : ''} onClick={() => setMethod('fgsm')}>FGSM</button>
          <button className={method === 'pgd' ? 'on' : ''} onClick={() => setMethod('pgd')}>PGD</button>
        </div>
      </div>

      <div className="panel__readouts">
        <div>
          L∞ distortion
          <b>{result ? result.linf.toFixed(3) : '—'}</b>
        </div>
        <div>
          L2 distortion
          <b>{result ? result.l2.toFixed(2) : '—'}</b>
        </div>
        <div>
          Model acc.
          <b>{model ? `${model.testAccuracy}%` : '—'}</b>
        </div>
      </div>

      <div className="advlab__dist">
        <span className="advlab__dist-label">Adversarial class probabilities</span>
        <ConfidenceBars forward={result?.adversarialForward ?? null} highlight={trueLabel ?? undefined} />
      </div>

      <p className="panel__source">
        Real FGSM/PGD on a 784→128→10 network — forward pass and input gradient hand-written, running
        entirely in your browser. Nothing you draw is transmitted.
      </p>
    </aside>
  );
}

// Small static thumbnail for the gallery buttons.
function SampleThumb({ pixels }: { pixels: Float32Array }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    paintDigit(ref.current, pixels);
  }, [pixels]);
  return <canvas ref={ref} width={40} height={40} />;
}
