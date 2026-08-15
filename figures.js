// Canvas figure drawing for Yulan.me — extracted verbatim from the page's
// logic class. Called with .call(this, ...) so `this.css` / `this.fit` still
// resolve against the component. No drawing logic was changed.
(function () {
  class YGFigures {
    mini(it, t, dt) {
      const { ctx, w, h } = it.state;
      const m = it.mem;
      const sig = this.css('--signalText');
      const warn = this.css('--warnText');
      const dim = this.css('--inkDim');
      const faint = this.css('--inkFaint');
      ctx.clearRect(0, 0, w, h);
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';

      if (it.key === 'soc') {
        // A console that keeps working: one source raises an alert, it moves through
        // investigation, it closes, and the queue goes quiet again.
        const src = ['AUTH', 'EDR', 'SIEM', 'VAPT'];
        const stages = ['ALERT', 'TRIAGE', 'CONTAIN', 'CLOSED'];
        if (!m.init) { m.init = 1; m.clock = 34951; m.who = 2; m.stage = -1; m.next = 1.4; m.rows = src.map(() => 0); }
        m.clock += dt * 1.2;
        m.next -= dt;
        if (m.next <= 0) {
          m.stage++;
          if (m.stage > 3) { m.stage = -1; m.who = (m.who + 1 + Math.floor(Math.random() * 3)) % 4; }
          m.next = m.stage < 0 ? 1.8 : 1.5;
        }
        const pad = 12, rowH = (h - pad * 2) / 4;
        for (let i = 0; i < 4; i++) {
          const y = pad + rowH * (i + 0.5);
          const secs = Math.floor(m.clock) - (3 - i) * 7;
          const hh = String(Math.floor(secs / 3600) % 24).padStart(2, '0');
          const mm = String(Math.floor(secs / 60) % 60).padStart(2, '0');
          const ss = String(secs % 60).padStart(2, '0');
          const hot = i === m.who && m.stage >= 0;
          ctx.globalAlpha = 1;
          ctx.fillStyle = hot ? dim : faint;
          ctx.fillText(src[i], pad, y);
          ctx.fillText(hh + ':' + mm + ':' + ss, pad + 46, y);
          if (hot) {
            const blink = m.stage === 0 ? 0.55 + 0.45 * Math.sin(t * 9) : 1;
            ctx.globalAlpha = blink;
            ctx.fillStyle = m.stage >= 3 ? sig : warn;
            ctx.fillText(stages[m.stage], pad + 118, y);
            ctx.globalAlpha = 0.9;
            ctx.fillRect(pad - 6, y - rowH / 2 + 2, 2, rowH - 4);
          } else {
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = sig;
            ctx.fillText('OK', pad + 118, y);
          }
        }
        ctx.globalAlpha = 1;
      }

      else if (it.key === 'ids') {
        // Packets pass. Every so often one behaves differently and is caught.
        const y = h * 0.44;
        if (!m.p) { m.p = []; m.next = 0; }
        m.next -= dt;
        if (m.next <= 0) {
          m.next = 0.42;
          m.p.push({ x: 8, bad: Math.random() < 0.16, caught: 0, dy: 0 });
        }
        const gate = w * 0.62;
        ctx.strokeStyle = faint; ctx.globalAlpha = 0.22; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(w - 8, y); ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(gate, y - 16); ctx.lineTo(gate, y + 22); ctx.stroke();
        ctx.globalAlpha = 1;
        m.p = m.p.filter(p => {
          p.x += 34 * dt;
          if (p.bad && p.x > gate && !p.caught) { p.caught = 1; }
          if (p.caught) { p.caught = Math.min(1.6, p.caught + dt); p.dy = Math.min(15, p.dy + 46 * dt); }
          if (p.x > w - 6) return false;
          ctx.globalAlpha = p.bad ? 0.95 : 0.5;
          ctx.fillStyle = p.bad ? warn : faint;
          ctx.beginPath(); ctx.arc(p.x, y + p.dy, p.bad ? 2.6 : 2, 0, Math.PI * 2); ctx.fill();
          if (p.caught) {
            ctx.globalAlpha = Math.max(0, 1.2 - p.caught * 0.7);
            ctx.strokeStyle = warn; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p.x, y + p.dy, 5 + p.caught * 4, 0, Math.PI * 2); ctx.stroke();
          }
          return true;
        });
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = sig;
        ctx.fillText('inspect', gate + 6, y - 24);
        ctx.globalAlpha = 1;
      }

      else if (it.key === 'handshake') {
        // Two endpoints keeping a channel open: a request crosses, a reply comes
        // back, the link verifies and holds for a moment, then it starts again.
        if (!m.init) { m.init = 1; m.t = 0; m.hold = 0; }
        m.t += dt * 0.5;
        const cyc = m.t % 1;
        const y = h * 0.5;
        const ax = 30, bx = w - 30;
        ctx.strokeStyle = faint; ctx.globalAlpha = 0.2; ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(bx, y); ctx.stroke();
        ctx.setLineDash([]);

        const verified = cyc > 0.66;
        if (verified) {
          ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3);
          ctx.strokeStyle = sig; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(bx, y); ctx.stroke();
        } else {
          const u = cyc < 0.33 ? cyc / 0.33 : (cyc - 0.33) / 0.33;
          const back = cyc >= 0.33;
          const px = back ? bx + (ax - bx) * u : ax + (bx - ax) * u;
          ctx.globalAlpha = 0.22;
          ctx.strokeStyle = sig; ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(back ? bx : ax, y); ctx.lineTo(px, y); ctx.stroke();
          ctx.globalAlpha = 0.9; ctx.fillStyle = sig;
          ctx.beginPath(); ctx.arc(px, y, 3, 0, Math.PI * 2); ctx.fill();
        }

        [[ax, 'you'], [bx, 'me']].forEach(([x], i) => {
          const active = verified || (i === 0 ? cyc < 0.33 : cyc >= 0.33 && cyc < 0.66);
          ctx.globalAlpha = active ? 0.35 : 0.12;
          ctx.fillStyle = sig;
          ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = active ? sig : faint;
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      else if (it.key === 'adv') {
        // A small network holding its shape. A perturbation enters one input and
        // the weights shift to absorb it, again and again.
        if (!m.init) {
          m.init = 1; m.pert = -1; m.next = 2.2; m.wob = 0;
          m.layers = [3, 4, 1];
        }
        m.next -= dt;
        if (m.next <= 0) { m.pert = Math.floor(Math.random() * 3); m.wob = 1; m.next = 3.4; }
        m.wob = Math.max(0, m.wob - dt * 0.5);
        const padX = 26, padY = 16;
        const cols = m.layers.map((n, li) => {
          const x = padX + (w - padX * 2) * (li / (m.layers.length - 1));
          return Array.from({ length: n }, (_, i) => ({
            x, y: padY + (h - padY * 2) * (n === 1 ? 0.5 : i / (n - 1))
          }));
        });
        for (let li = 0; li < cols.length - 1; li++) {
          cols[li].forEach((a, ai) => cols[li + 1].forEach((b, bi) => {
            const k = ai * 3 + bi + li * 7;
            const jitter = m.wob * Math.sin(t * 5 + k) * 0.7;
            ctx.strokeStyle = faint;
            ctx.globalAlpha = 0.2 + Math.abs(jitter) * 0.5;
            ctx.lineWidth = 0.7 + Math.abs(jitter) * 1.1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }));
        }
        // the signal travelling forward, continuously
        const phase = (t * 0.42) % 1;
        for (let li = 0; li < cols.length - 1; li++) {
          cols[li].forEach((a, ai) => cols[li + 1].forEach(b => {
            const seg = (phase * (cols.length - 1)) - li;
            if (seg < 0 || seg > 1) return;
            ctx.globalAlpha = 0.65 * Math.sin(seg * Math.PI);
            ctx.fillStyle = ai === m.pert && m.wob > 0.2 ? warn : sig;
            ctx.beginPath();
            ctx.arc(a.x + (b.x - a.x) * seg, a.y + (b.y - a.y) * seg, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }));
        }
        cols.forEach((col, li) => col.forEach((p, i) => {
          const hot = li === 0 && i === m.pert && m.wob > 0.05;
          ctx.globalAlpha = hot ? 0.95 : 0.8;
          ctx.fillStyle = hot ? warn : li === cols.length - 1 ? sig : faint;
          ctx.beginPath(); ctx.arc(p.x, p.y, hot ? 3.4 : 2.8, 0, Math.PI * 2); ctx.fill();
          if (hot) {
            ctx.globalAlpha = m.wob * 0.5;
            ctx.strokeStyle = warn; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 4 + (1 - m.wob) * 7, 0, Math.PI * 2); ctx.stroke();
          }
        }));
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = m.wob > 0.2 ? warn : faint;
        ctx.fillText(m.wob > 0.2 ? '\u03b5' : '', 8, h / 2);
        ctx.globalAlpha = 1;
      }
    }

    // One figure per project. Each is a loop with no end state: the idea keeps happening.
    fig(f, t, dt) {
      const { ctx, w, h } = f.state;
      const sig = this.css('--signal');
      const warn = this.css('--warn');
      const rule = this.css('--rule');
      const faint = this.css('--inkFaint');
      const m = f.mem;
      const sigT = this.css('--signalText');
      const warnT = this.css('--warnText');
      ctx.clearRect(0, 0, w, h);
      ctx.font = '500 10px "JetBrains Mono", monospace';
      const mono = (s, x, y, col, a) => { ctx.globalAlpha = a === undefined ? 1 : a; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.globalAlpha = 1; };
      const rnd = () => Math.random();

      if (f.key === 'adversec') {
        // Frames on the bus. A perturbation front sweeps through; inside it the
        // signal deforms and turns amber, behind it the hardened model recovers it.
        const rows = 7, pad = 16;
        const laneH = (h - pad * 2) / rows;
        if (!m.rows) {
          m.rows = [];
          for (let r = 0; r < rows; r++) {
            const bars = [];
            for (let x = pad; x < w - pad; x += 9 + rnd() * 10) bars.push({ x, w: 4 + rnd() * 7, k: rnd() });
            m.rows.push(bars);
          }
        }
        const front = ((t * 0.30) % 1.45 - 0.22) * w;
        for (let r = 0; r < rows; r++) {
          const y = pad + laneH * (r + 0.5);
          for (const b of m.rows[r]) {
            const d = (b.x - front) / (w * 0.16);
            const inside = Math.abs(d) < 1;
            const before = d > 0;
            const jitter = inside ? Math.sin((t * 6 + b.k * 9)) * (1 - Math.abs(d)) * 6 : 0;
            const hardened = !before && !inside;
            ctx.globalAlpha = before ? 0.30 : inside ? 0.9 : 0.85;
            ctx.fillStyle = inside ? warn : hardened ? sig : faint;
            ctx.fillRect(b.x, y + jitter - 1.5, b.w, 3);
          }
        }
        ctx.globalAlpha = 1;
        const g = ctx.createLinearGradient(front - w * 0.16, 0, front + w * 0.16, 0);
        g.addColorStop(0, 'rgba(184,122,14,0)');
        g.addColorStop(0.5, 'rgba(184,122,14,.13)');
        g.addColorStop(1, 'rgba(184,122,14,0)');
        ctx.fillStyle = g; ctx.fillRect(front - w * 0.16, 0, w * 0.32, h);
        ctx.strokeStyle = warn; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(front + 0.5, 6); ctx.lineTo(front + 0.5, h - 6); ctx.stroke();
        ctx.globalAlpha = 1;
        mono('\u03b5 = 0.05  PGD', 14, 12, warnT, .85);
        mono('recovered', w - 76, h - 6, sigT, .8);
      }

      else if (f.key === 'glean') {
        // 960 findings enter on the left. Entity resolution culls almost all of them.
        // The few that survive stack into a ranked brief on the right.
        const gate = w * 0.52, out = w * 0.74;
        if (!m.p) { m.p = []; m.ranked = [0, 0, 0, 0, 0]; m.seen = 0; m.kept = 0; }
        if (m.p.length < 130 && rnd() < dt * 60) {
          for (let i = 0; i < 3; i++) m.p.push({ x: 8, y: 18 + rnd() * (h - 36), v: 26 + rnd() * 42, keep: rnd() < 0.09, a: 0 });
        }
        ctx.strokeStyle = rule; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gate, 12); ctx.lineTo(gate, h - 12); ctx.stroke();
        m.p = m.p.filter(p => {
          p.x += p.v * dt;
          p.a = Math.min(1, p.a + dt * 4);
          if (p.x > gate && !p.keep) { p.a -= dt * 5.5; if (p.a <= 0) return false; }
          if (p.x > out) {
            const slot = Math.floor(rnd() * 5);
            m.ranked[slot] = Math.min(1, m.ranked[slot] + 0.34);
            m.kept++;
            return false;
          }
          ctx.globalAlpha = Math.max(0, p.a) * (p.keep ? 0.95 : 0.5);
          ctx.fillStyle = p.keep && p.x > gate ? sig : faint;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.keep ? 2.2 : 1.5, 0, Math.PI * 2); ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
          m.ranked[i] = Math.max(0, m.ranked[i] - dt * 0.12);
          const y = 26 + i * ((h - 52) / 4);
          const bw = (w - out - 22) * m.ranked[i];
          ctx.globalAlpha = 0.18; ctx.fillStyle = faint;
          ctx.fillRect(out + 8, y - 3, w - out - 22, 6);
          ctx.globalAlpha = 0.9; ctx.fillStyle = sig;
          ctx.fillRect(out + 8, y - 3, bw, 6);
        }
        ctx.globalAlpha = 1;
        mono('~960 collected', 10, 12, faint, .8);
        mono('7 that matter', out + 8, h - 6, sigT, .85);
      }

      else if (f.key === 'neteagle') {
        // Everything inbound passes through one gate. Some of it does not come out.
        const gx = w * 0.5, cy = h / 2;
        if (!m.p) { m.p = []; m.pulse = 0; m.dev = [0, 0, 0]; }
        if (rnd() < dt * 32) m.p.push({ x: 6, y: 18 + rnd() * (h - 36), bad: rnd() < 0.3, s: 0, dev: Math.floor(rnd() * 3), a: 1 });
        ctx.strokeStyle = rule; ctx.lineWidth = 1;
        const devY = [h * 0.24, h * 0.5, h * 0.76];
        devY.forEach((y, i) => {
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.moveTo(gx + 26, cy); ctx.lineTo(w - 34, y); ctx.stroke();
          const lit = m.dev[i];
          ctx.fillStyle = lit > 0.05 ? sig : faint;
          ctx.globalAlpha = 0.25 + lit * 0.7;
          ctx.fillRect(w - 32, y - 9, 20, 18);
          m.dev[i] = Math.max(0, lit - dt * 1.6);
        });
        ctx.globalAlpha = 1;
        ctx.strokeStyle = sig; ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35 + m.pulse * 0.65;
        ctx.strokeRect(gx - 24, cy - 26, 48, 52);
        ctx.globalAlpha = 1;
        m.pulse = Math.max(0, m.pulse - dt * 2.2);
        m.p = m.p.filter(p => {
          if (p.s === 0) {
            p.x += 62 * dt;
            if (p.x >= gx - 24) {
              p.s = p.bad ? 2 : 1;
              m.pulse = 1;
              if (!p.bad) m.dev[p.dev] = 1;
            }
          } else if (p.s === 1) {
            const ty = devY[p.dev];
            p.x += 74 * dt;
            p.y += (ty - p.y) * Math.min(1, dt * 4);
            if (p.x > w - 34) return false;
          } else {
            p.x -= 90 * dt; p.a -= dt * 1.1;
            if (p.a <= 0) return false;
          }
          ctx.globalAlpha = Math.max(0, p.a) * (p.bad ? 0.9 : 0.75);
          ctx.fillStyle = p.s === 2 ? warn : p.s === 1 ? sig : faint;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2); ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;
        mono('wan', 8, h - 6, faint, .7);
        mono('gateway', gx - 24, cy - 34, sigT, .85);
        mono('lan', w - 32, h - 6, faint, .7);
      }

      else if (f.key === 'domain') {
        // A Certificate Transparency history scrolling past. Most of it is routine.
        // A cluster of issuances sits before the ownership marker and never stops arriving.
        const base = h - 26;
        if (!m.c) {
          m.c = [];
          for (let i = 0; i < 90; i++) m.c.push({ x: i * 34 + rnd() * 20, hh: 8 + rnd() * 30, spam: (i % 17) < 4 });
          m.span = 90 * 34;
        }
        const shift = (t * 26) % m.span;
        ctx.strokeStyle = rule; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(w, base); ctx.stroke();
        for (const c of m.c) {
          let x = c.x - shift;
          if (x < -20) x += m.span;
          if (x < -10 || x > w + 10) continue;
          ctx.globalAlpha = c.spam ? 0.85 : 0.32;
          ctx.fillStyle = c.spam ? warn : faint;
          ctx.fillRect(x, base - c.hh, 2, c.hh);
        }
        const own = ((m.span * 0.62) - shift + m.span) % m.span;
        if (own > -40 && own < w + 40) {
          ctx.globalAlpha = 1; ctx.strokeStyle = sig; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(own, 14); ctx.lineTo(own, base); ctx.stroke(); ctx.setLineDash([]);
          mono('ownership', own + 6, 20, sigT, .9);
        }
        ctx.globalAlpha = 1;
        mono('crt.sh \u00b7 600+ records', 10, 14, faint, .75);
        mono('spam issuance', 10, base + 16, warnT, .8);
      }

      else if (f.key === 'meridian') {
        // The catalogue fills itself: a record lands, its fields light up, it settles
        // into the archive, and the next one arrives. There is no final state.
        const cols = 12, rows = 6, pad = 16;
        const cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
        if (!m.g) { m.g = new Array(cols * rows).fill(0); m.next = 0; m.order = []; }
        if (!m.order.length) {
          m.order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => rnd() - 0.5);
          m.k = 0;
        }
        m.next -= dt;
        if (m.next <= 0) {
          m.g[m.order[m.k % m.order.length]] = 1;
          m.k++;
          if (m.k % m.order.length === 0) m.order.sort(() => rnd() - 0.5);
          m.next = 0.13;
        }
        for (let i = 0; i < m.g.length; i++) {
          const c = i % cols, r = Math.floor(i / cols);
          const x = pad + c * cw, y = pad + r * ch;
          const v = m.g[i];
          m.g[i] = Math.max(0.06, v - dt * 0.22);
          ctx.globalAlpha = 0.1 + v * 0.75;
          ctx.fillStyle = v > 0.5 ? sig : faint;
          ctx.fillRect(x + 1, y + 1, cw - 4, ch - 4);
        }
        ctx.globalAlpha = 1;
        mono('provenance \u00b7 condition \u00b7 valuation', pad, h - 4, faint, .7);
      }

      else if (f.key === 'rampe') {
        // Each dish placed by heat and effort, breathing slightly, occasionally replaced.
        const pad = 26;
        if (!m.d) {
          m.d = [];
          for (let i = 0; i < 34; i++) m.d.push({ x: rnd(), y: rnd(), r: 2 + rnd() * 3, ph: rnd() * 6.28, hot: rnd() < 0.35, a: rnd() });
        }
        ctx.strokeStyle = rule; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - 12, h - pad);
        ctx.moveTo(pad, 12); ctx.lineTo(pad, h - pad); ctx.stroke();
        ctx.globalAlpha = 0.5;
        for (let i = 1; i < 4; i++) {
          const y = (h - pad - 12) * (i / 4) + 12;
          ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - 12, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (const d of m.d) {
          d.a = Math.min(1, d.a + dt * 0.5);
          if (rnd() < dt * 0.05) { d.x = rnd(); d.y = rnd(); d.hot = rnd() < 0.35; d.a = 0; }
          const bx = pad + (w - pad - 20) * d.x + Math.sin(t * 0.5 + d.ph) * 2.5;
          const by = 16 + (h - pad - 26) * d.y + Math.cos(t * 0.42 + d.ph) * 2.5;
          const pulse = 1 + Math.sin(t * 1.5 + d.ph) * 0.16;
          ctx.globalAlpha = 0.75 * d.a;
          ctx.fillStyle = d.hot ? warn : sig;
          ctx.beginPath(); ctx.arc(bx, by, d.r * pulse, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        mono('heat', 8, 16, faint, .75);
        mono('effort \u2192', w - 62, h - 8, faint, .75);
      }
    }
  }
  window.YGFigures = new YGFigures();
})();
