/* adversec — behaviour, no eval, no framework */
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

  // A perturbation front sweeping the bus: frames deform inside it and recover behind it.
  figure() {
    const cv = document.querySelector('[data-fig]');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let w = 0, h = 0, rows = null;
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rows = null;
    };
    fit();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = 7;
    const draw = (now) => {
      const t = now / 1000 * (reduce ? 0 : 0.75);
      if (!rows) {
        rows = [];
        for (let r = 0; r < N; r++) {
          const bars = [];
          for (let x = 18; x < w - 18; x += 9 + Math.random() * 11) bars.push({ x, w: 4 + Math.random() * 8, k: Math.random() });
          rows.push(bars);
        }
      }
      const pad = 16, laneH = (h - pad * 2) / N;
      ctx.clearRect(0, 0, w, h);
      const front = ((t * 0.3) % 1.45 - 0.22) * w;
      for (let r = 0; r < N; r++) {
        const y = pad + laneH * (r + 0.5);
        for (const b of rows[r]) {
          const d = (b.x - front) / (w * 0.15);
          const inside = Math.abs(d) < 1;
          const before = d > 0;
          const j = inside ? Math.sin(t * 6 + b.k * 9) * (1 - Math.abs(d)) * 6 : 0;
          ctx.globalAlpha = before ? 0.26 : inside ? 0.95 : 0.9;
          ctx.fillStyle = inside ? '#E0AC4E' : before ? 'rgba(245,243,238,.5)' : '#5CCFA5';
          ctx.fillRect(b.x, y + j - 1.5, b.w, 3);
        }
      }
      ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(front - w * 0.15, 0, front + w * 0.15, 0);
      g.addColorStop(0, 'rgba(224,172,78,0)');
      g.addColorStop(0.5, 'rgba(224,172,78,.12)');
      g.addColorStop(1, 'rgba(224,172,78,0)');
      ctx.fillStyle = g; ctx.fillRect(front - w * 0.15, 0, w * 0.3, h);
      ctx.strokeStyle = '#E0AC4E'; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(front + 0.5, 6); ctx.lineTo(front + 0.5, h - 6); ctx.stroke();
      ctx.globalAlpha = 1;
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
