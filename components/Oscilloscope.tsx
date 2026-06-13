'use client';

import { useEffect, useRef } from 'react';

export interface ScopePort {
  port: number;
  records: number;
}

interface Props {
  /**
   * Live top attacked ports (SANS ISC), arranged for the trace. Each on-screen
   * pulse represents one of these, drawn at random with probability
   * proportional to its real share of today's traffic; pulse height tracks
   * its volume. Without data a calm default pattern plays.
   */
  ports?: ScopePort[];
  /** Real observed attacks/sec — drives how often pulses fire (compressed to a readable pace). */
  ratePerSec?: number;
  /** Fired with the index into `ports` when a pulse crosses the trigger cursor. */
  onTrigger?: (index: number) => void;
}

const W = 420;
const H = 130;
const SCROLL_SPEED = 42; // px/sec, heart-monitor pace
const TRIGGER_X = W * 0.55; // the decode cursor

interface Pulse {
  x: number; // world x-coordinate (screen x = x - offset)
  amp: number;
  w: number;
  anomaly: boolean;
  idx: number; // index into the port distribution
  fired: boolean; // has crossed the trigger cursor
}

/**
 * The hero's signature element: a live event trace of global attack traffic.
 * Pulses enter from the right and scroll left; their frequency and heights
 * follow the live telemetry. A trigger cursor mid-scope "decodes" each pulse
 * as it crosses (via onTrigger). Falls back to a static frame when
 * prefers-reduced-motion is set.
 */
export default function Oscilloscope({ ports, ratePerSec, onTrigger }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  // The callback identity changes every parent render; keep the latest in a
  // ref so the animation effect doesn't restart.
  const onTriggerRef = useRef<Props['onTrigger']>(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const mid = H / 2;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Port distribution: min–max scaled so height differences stay visible
    // even when the real counts bunch together (they often do).
    const counts = ports && ports.length > 0 ? ports.map((p) => p.records) : [44, 30, 24, 18, 10];
    const maxC = Math.max(...counts);
    const minC = Math.min(...counts);
    const span = Math.max(1, maxC - minC);
    const amps = counts.map((c) => 14 + 32 * ((c - minC) / span));
    const total = counts.reduce((a, b) => a + b, 0);

    // Visual pulse rate: tied to the real rate but compressed to stay readable.
    const visualRate = Math.min(0.8, Math.max(0.35, (ratePerSec ?? 4) / 14));

    // Weighted random port pick — rank 1 fires most often, like the real wire.
    function pickPulse(atX: number): Pulse {
      let r = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < counts.length; i++) {
        r -= counts[i];
        if (r <= 0) {
          idx = i;
          break;
        }
      }
      const jitter = 0.88 + Math.random() * 0.24;
      return {
        x: atX,
        amp: amps[idx] * jitter,
        w: 12 + Math.random() * 5,
        anomaly: idx === counts.indexOf(maxC),
        idx,
        fired: false,
      };
    }

    let offset = 0;
    let pulses: Pulse[] = [];

    // Pre-fill the visible window so the trace starts mid-broadcast. Pulses
    // already left of the cursor count as fired so the readout starts clean.
    for (let x = 30; x < W; x += (SCROLL_SPEED / visualRate) * (0.7 + Math.random() * 0.6)) {
      const p = pickPulse(x);
      p.fired = x <= TRIGGER_X;
      pulses.push(p);
    }

    // Smooth deterministic baseline noise — the wire is never perfectly flat.
    function noise(sx: number, t: number): number {
      return 1.4 * Math.sin(sx * 0.045 + t * 0.9) + 0.9 * Math.sin(sx * 0.11 - t * 1.6);
    }

    function traceY(sx: number, t: number): number {
      let y = mid + noise(sx, t);
      for (const p of pulses) {
        const px = p.x - offset;
        const dx = sx - px;
        if (dx >= 0 && dx <= p.w) {
          const phase = dx / p.w;
          const v =
            phase < 0.33 ? phase / 0.33 : phase < 0.66 ? 1 - 2 * ((phase - 0.33) / 0.33) : -1 + (phase - 0.66) / 0.34;
          y -= v * p.amp;
        }
      }
      return y;
    }

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = '#1A2027';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gy = mid - 33; gy <= mid + 33; gy += 33) {
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
      }
      for (let gx = 60; gx < W; gx += 60) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
      }
      ctx.stroke();

      // trigger cursor — where pulses get decoded
      ctx.strokeStyle = 'rgba(224, 176, 80, 0.28)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(TRIGGER_X, 4);
      ctx.lineTo(TRIGGER_X, H - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      // caret at the top of the cursor
      ctx.beginPath();
      ctx.moveTo(TRIGGER_X - 4, 0);
      ctx.lineTo(TRIGGER_X + 4, 0);
      ctx.lineTo(TRIGGER_X, 6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(224, 176, 80, 0.5)';
      ctx.fill();

      // trace + fill
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const y = traceY(x, t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#3DDC97';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'rgba(61, 220, 151, 0.30)');
      grad.addColorStop(1, 'rgba(61, 220, 151, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // One steady marker per top-port pulse, riding at its peak.
      for (const p of pulses) {
        if (!p.anomaly) continue;
        const peakX = p.x - offset + p.w * 0.33;
        if (peakX < -10 || peakX > W + 10) continue;
        const peakY = mid + noise(peakX, t) - p.amp;
        ctx.beginPath();
        ctx.arc(peakX, peakY - 8, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#E0B050';
        ctx.fill();
      }
    }

    if (reduced) {
      draw(0);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let spawnDebt = 0;
    const tick = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      offset += (dt / 1000) * SCROLL_SPEED;

      // Spawn new pulses at the visual rate, entering off the right edge.
      // Keep a minimum gap so consecutive pulses stay distinct.
      spawnDebt += (dt / 1000) * visualRate;
      while (spawnDebt >= 1) {
        spawnDebt -= 1;
        const lastX = pulses.length > 0 ? pulses[pulses.length - 1].x : -Infinity;
        const candidate = offset + W + 10 + Math.random() * 24;
        pulses.push(pickPulse(Math.max(candidate, lastX + 30)));
      }

      // Decode pulses as their peaks cross the trigger cursor.
      for (const p of pulses) {
        if (p.fired) continue;
        const peakX = p.x - offset + p.w * 0.33;
        if (peakX <= TRIGGER_X) {
          p.fired = true;
          onTriggerRef.current?.(p.idx);
        }
      }

      // Drop pulses that have scrolled out of view.
      pulses = pulses.filter((p) => p.x - offset > -40);

      draw(now / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ports, ratePerSec]);

  return (
    <canvas
      ref={ref}
      style={{ width: '100%', height: 'auto', aspectRatio: '420 / 130' }}
      role="img"
      aria-label="Live trace of global attack traffic; pulse frequency and heights follow real honeypot telemetry"
    />
  );
}
