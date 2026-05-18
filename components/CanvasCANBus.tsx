'use client';

import { useEffect, useRef } from 'react';

interface Segment {
  type: 'idle' | 'pulse' | 'data' | 'ramp';
  len: number;
  level?: number;
  peak?: number;
}

interface Props {
  id?: string;
  className?: string;
  opacityScale?: number; // multiplier on default opacities (e.g. 0.2 for contact bg)
}

export default function CanvasCANBus({ id = 'hero-canvas', className = 'hero__canvas', opacityScale = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const buildFrame = (): Segment[] => {
      const out: Segment[] = [];
      out.push({ type: 'idle', len: 14 + Math.random() * 24 });
      out.push({ type: 'pulse', len: 6, level: 0.75 });
      const idBits = 11;
      for (let i = 0; i < idBits; i++) {
        out.push({ type: 'data', len: 5 + Math.random() * 3, level: Math.random() > 0.5 ? 0.45 : 0.18 });
      }
      out.push({ type: 'pulse', len: 4, level: 0.5 });
      out.push({ type: 'ramp', len: 120 + Math.random() * 80, peak: 0.9 });
      for (let i = 0; i < 6; i++) {
        out.push({ type: 'data', len: 4, level: Math.random() > 0.5 ? 0.6 : 0.25 });
      }
      out.push({ type: 'pulse', len: 8, level: 0.4 });
      out.push({ type: 'idle', len: 18 });
      return out;
    };

    let segments: Segment[] = [];
    let totalLen = 0;
    const fillSegments = (targetLen: number) => {
      while (totalLen < targetLen) {
        const frame = buildFrame();
        frame.forEach((s) => {
          segments.push(s);
          totalLen += s.len;
        });
      }
    };
    fillSegments(3000);

    let offset = 400;
    const speed = 0.45;

    const drawTrace = (yMid: number, opacity: number, scale: number) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(27, 42, 78, ${opacity * opacityScale})`;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      let x = -offset;
      let prevLevel = 0;
      for (const s of segments) {
        const endX = x + s.len;
        if (endX < -10) {
          x = endX;
          continue;
        }
        if (x > w + 10) break;

        if (s.type === 'idle') {
          ctx.moveTo(x, yMid);
          ctx.lineTo(endX, yMid);
          prevLevel = 0;
        } else if (s.type === 'pulse') {
          const lv = s.level ?? 0;
          const y = yMid - lv * scale;
          ctx.moveTo(x, yMid - prevLevel * scale);
          ctx.lineTo(x, y);
          ctx.lineTo(endX, y);
          ctx.lineTo(endX, yMid);
          prevLevel = 0;
        } else if (s.type === 'data') {
          const lv = s.level ?? 0;
          const y = yMid - lv * scale;
          ctx.moveTo(x, yMid - prevLevel * scale);
          ctx.lineTo(x, y);
          ctx.lineTo(endX, y);
          prevLevel = lv;
        } else if (s.type === 'ramp') {
          const peak = s.peak ?? 0.8;
          const steps = Math.max(20, Math.floor(s.len / 4));
          ctx.moveTo(x, yMid - prevLevel * scale);
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x + t * s.len;
            const py = yMid - (Math.sin(t * Math.PI) * peak + Math.sin(t * Math.PI * 3) * 0.08) * scale;
            ctx.lineTo(px, py);
          }
          prevLevel = 0;
        }
        x = endX;
      }
      ctx.stroke();
    };

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const baseScale = h * 0.14;
      drawTrace(h * 0.18, 0.18, baseScale * 0.8);
      drawTrace(h * 0.38, 0.24, baseScale * 1.0);
      drawTrace(h * 0.62, 0.21, baseScale * 1.1);
      drawTrace(h * 0.85, 0.15, baseScale * 0.7);

      ctx.strokeStyle = `rgba(27, 42, 78, ${0.10 * opacityScale})`;
      ctx.lineWidth = 1;
      [0.18, 0.38, 0.62, 0.85].forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(0, h * p);
        ctx.lineTo(w, h * p);
        ctx.stroke();
      });

      offset += speed;
      while (segments.length && segments[0].len < offset - 200) {
        offset -= segments[0].len;
        totalLen -= segments[0].len;
        segments.shift();
      }
      if (totalLen - offset < w + 400) fillSegments(totalLen + 1200);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [opacityScale]);

  return <canvas ref={ref} id={id} className={className} aria-hidden="true" />;
}
