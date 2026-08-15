/* glean — behaviour, no eval, no framework */
(function () {

class Page {
  componentDidMount() {
    this.reveal();
    this.top();
    this.figure();
  }

  reveal() {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    els.forEach(el => { if (!reduce) el.style.opacity = '0'; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.animation = 'ygRise .7s cubic-bezier(.2,.7,.2,1) both';
        e.target.style.opacity = '';
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => { el.style.opacity = ''; }), 4000);
  }

  top() {
    const btn = document.querySelector('[data-top]');
    if (!btn) return;
    const show = (on) => {
      btn.style.opacity = on ? '1' : '0';
      btn.style.transform = on ? 'none' : 'translateY(10px)';
      btn.style.pointerEvents = on ? 'auto' : 'none';
    };
    // the host may own scrolling, so measure the sentinel's position rather than trust scrollY
    const sentinel = document.querySelector('[data-sentinel]');
    let last = null;
    const sync = () => {
      const off = sentinel ? -sentinel.getBoundingClientRect().top : window.scrollY;
      const on = off > window.innerHeight * 0.5;
      if (on !== last) { last = on; show(on); }
    };
    sync();
    setInterval(sync, 200);
    window.addEventListener('scroll', sync, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (document.scrollingElement) document.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  figure() {
    const cv = document.querySelector('[data-fig]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const KEY = cv.getAttribute('data-fig');
    let w = 0, h = 0, m = {};
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      m = {};
    };
    fit();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rate = reduce ? 0 : 0.8;
    const SIG = '#5CCFA5', WARN = '#E0AC4E', FAINT = 'rgba(245,243,238,.45)';
    let prev = performance.now();
    const draw = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000) * rate;
      prev = now;
      const t = now / 1000 * rate;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '500 10px "JetBrains Mono", monospace';

      if (KEY === 'glean') {
        const gate = w * 0.52, out = w * 0.76;
        if (!m.p) { m.p = []; m.ranked = [0, 0, 0, 0, 0]; }
        if (m.p.length < 170 && Math.random() < dt * 60) {
          for (let i = 0; i < 3; i++) m.p.push({ x: 8, y: 18 + Math.random() * (h - 36), v: 26 + Math.random() * 46, keep: Math.random() < 0.09, a: 0 });
        }
        ctx.strokeStyle = 'rgba(245,243,238,.16)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gate, 12); ctx.lineTo(gate, h - 12); ctx.stroke();
        m.p = m.p.filter(p => {
          p.x += p.v * dt; p.a = Math.min(1, p.a + dt * 4);
          if (p.x > gate && !p.keep) { p.a -= dt * 5.5; if (p.a <= 0) return false; }
          if (p.x > out) { m.ranked[Math.floor(Math.random() * 5)] = Math.min(1, m.ranked[Math.floor(Math.random() * 5)] + 0.34); return false; }
          ctx.globalAlpha = Math.max(0, p.a) * (p.keep ? 0.95 : 0.45);
          ctx.fillStyle = p.keep && p.x > gate ? SIG : FAINT;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.keep ? 2.3 : 1.5, 0, Math.PI * 2); ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
          m.ranked[i] = Math.max(0, m.ranked[i] - dt * 0.12);
          const y = 24 + i * ((h - 48) / 4);
          ctx.globalAlpha = 0.14; ctx.fillStyle = FAINT;
          ctx.fillRect(out + 8, y - 3, w - out - 24, 6);
          ctx.globalAlpha = 0.9; ctx.fillStyle = SIG;
          ctx.fillRect(out + 8, y - 3, (w - out - 24) * m.ranked[i], 6);
        }
        ctx.globalAlpha = 1;
      }

      else if (KEY === 'neteagle') {
        const gx = w * 0.5, cy = h / 2;
        if (!m.p) { m.p = []; m.pulse = 0; m.dev = [0, 0, 0]; }
        if (Math.random() < dt * 32) m.p.push({ x: 6, y: 18 + Math.random() * (h - 36), bad: Math.random() < 0.3, s: 0, dev: Math.floor(Math.random() * 3), a: 1 });
        const devY = [h * 0.22, h * 0.5, h * 0.78];
        ctx.strokeStyle = 'rgba(245,243,238,.14)'; ctx.lineWidth = 1;
        devY.forEach((y, i) => {
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.moveTo(gx + 26, cy); ctx.lineTo(w - 40, y); ctx.stroke();
          const lit = m.dev[i];
          ctx.fillStyle = lit > 0.05 ? SIG : FAINT;
          ctx.globalAlpha = 0.22 + lit * 0.7;
          ctx.fillRect(w - 38, y - 9, 22, 18);
          m.dev[i] = Math.max(0, lit - dt * 1.6);
        });
        ctx.globalAlpha = 0.35 + m.pulse * 0.65;
        ctx.strokeStyle = SIG; ctx.lineWidth = 1.5;
        ctx.strokeRect(gx - 24, cy - 26, 48, 52);
        ctx.globalAlpha = 1;
        m.pulse = Math.max(0, m.pulse - dt * 2.2);
        m.p = m.p.filter(p => {
          if (p.s === 0) {
            p.x += 62 * dt;
            if (p.x >= gx - 24) { p.s = p.bad ? 2 : 1; m.pulse = 1; if (!p.bad) m.dev[p.dev] = 1; }
          } else if (p.s === 1) {
            p.x += 74 * dt; p.y += (devY[p.dev] - p.y) * Math.min(1, dt * 4);
            if (p.x > w - 40) return false;
          } else { p.x -= 90 * dt; p.a -= dt * 1.1; if (p.a <= 0) return false; }
          ctx.globalAlpha = Math.max(0, p.a) * 0.85;
          ctx.fillStyle = p.s === 2 ? WARN : p.s === 1 ? SIG : FAINT;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
          return true;
        });
        ctx.globalAlpha = 1;
      }

      else if (KEY === 'domain') {
        const base = h - 24;
        if (!m.c) {
          m.c = [];
          for (let i = 0; i < 110; i++) m.c.push({ x: i * 30 + Math.random() * 18, hh: 8 + Math.random() * (h * 0.45), spam: (i % 17) < 4 });
          m.span = 110 * 30;
        }
        const shift = (t * 26) % m.span;
        ctx.strokeStyle = 'rgba(245,243,238,.16)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(w, base); ctx.stroke();
        for (const c of m.c) {
          let x = c.x - shift;
          if (x < -20) x += m.span;
          if (x < -10 || x > w + 10) continue;
          ctx.globalAlpha = c.spam ? 0.85 : 0.3;
          ctx.fillStyle = c.spam ? WARN : FAINT;
          ctx.fillRect(x, base - c.hh, 2, c.hh);
        }
        const own = ((m.span * 0.62) - shift + m.span) % m.span;
        if (own > -40 && own < w + 40) {
          ctx.globalAlpha = 1; ctx.strokeStyle = SIG; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(own, 14); ctx.lineTo(own, base); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = SIG; ctx.fillText('ownership', own + 6, 20);
        }
        ctx.globalAlpha = 1;
      }

      else if (KEY === 'meridian') {
        const cols = 18, rows = 7, pad = 14;
        const cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
        if (!m.g) { m.g = new Array(cols * rows).fill(0.06); m.next = 0; m.order = []; m.k = 0; }
        if (!m.order.length) { m.order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5); m.k = 0; }
        m.next -= dt;
        if (m.next <= 0) {
          m.g[m.order[m.k % m.order.length]] = 1; m.k++;
          if (m.k % m.order.length === 0) m.order.sort(() => Math.random() - 0.5);
          m.next = 0.1;
        }
        for (let i = 0; i < m.g.length; i++) {
          const c = i % cols, r = Math.floor(i / cols);
          const v = m.g[i];
          m.g[i] = Math.max(0.06, v - dt * 0.22);
          ctx.globalAlpha = 0.08 + v * 0.7;
          ctx.fillStyle = v > 0.5 ? SIG : FAINT;
          ctx.fillRect(pad + c * cw + 1, pad + r * ch + 1, cw - 3, ch - 3);
        }
        ctx.globalAlpha = 1;
      }

      else if (KEY === 'rampe') {
        const pad = 26;
        if (!m.d) {
          m.d = [];
          for (let i = 0; i < 40; i++) m.d.push({ x: Math.random(), y: Math.random(), r: 2 + Math.random() * 3.4, ph: Math.random() * 6.28, hot: Math.random() < 0.35, a: Math.random() });
        }
        ctx.strokeStyle = 'rgba(245,243,238,.14)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - 14, h - pad);
        ctx.moveTo(pad, 12); ctx.lineTo(pad, h - pad); ctx.stroke();
        ctx.globalAlpha = 0.5;
        for (let i = 1; i < 4; i++) {
          const y = (h - pad - 12) * (i / 4) + 12;
          ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - 14, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (const d of m.d) {
          d.a = Math.min(1, d.a + dt * 0.5);
          if (Math.random() < dt * 0.05) { d.x = Math.random(); d.y = Math.random(); d.hot = Math.random() < 0.35; d.a = 0; }
          const bx = pad + (w - pad - 24) * d.x + Math.sin(t * 0.5 + d.ph) * 2.5;
          const by = 16 + (h - pad - 28) * d.y + Math.cos(t * 0.42 + d.ph) * 2.5;
          ctx.globalAlpha = 0.75 * d.a;
          ctx.fillStyle = d.hot ? WARN : SIG;
          ctx.beginPath(); ctx.arc(bx, by, d.r * (1 + Math.sin(t * 1.5 + d.ph) * 0.16), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 160); });
  }
}

Page.prototype.setState = function (p) { this.state = Object.assign({}, this.state, typeof p === 'function' ? p(this.state) : p); };
Page.prototype.forceUpdate = function () {};
var boot = function () {
  var c = new Page();
  c.props = {};
  c.state = {};
  try { c.componentDidMount(); } catch (e) { console.error('boot', e); }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
