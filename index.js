/* index — behaviour, no eval, no framework */
(function () {

class Page {
  componentDidMount() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motion = this.props.motion ?? 55;
    const root = document.documentElement;

    if (this.props.accent && this.props.accent !== '#0E8A5F') {
      root.style.setProperty('--signal', this.props.accent);
    }
    const stored = (() => { try { return localStorage.getItem('yg-theme'); } catch (e) { return null; } })();
    const theme = stored || this.props.theme || 'light';
    root.setAttribute('data-theme', theme);
    const btn = document.querySelector('[data-yg-theme]');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☾';
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        btn.textContent = next === 'dark' ? '☀' : '☾';
        try { localStorage.setItem('yg-theme', next); } catch (e) {}
        this._colors = null;
      });
    }

    // scroll progress
    const bar = document.querySelector('[data-yg-progress]');
    const onScroll = () => {
      if (!bar) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // reveal on scroll (JS adds the hidden state, so no-JS shows everything)
    if (!reduce && motion > 0) {
      const dist = 8 + (motion / 100) * 16;
      const els = Array.from(document.querySelectorAll('[data-yg-reveal]'));
      let live = false;
      els.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(' + dist + 'px)';
        el.style.transition = 'opacity .75s cubic-bezier(.2,.7,.3,1), transform .75s cubic-bezier(.2,.7,.3,1)';
        el.style.willChange = 'opacity, transform';
      });
      const show = (el, stagger) => {
        if (el.dataset.ygShown) return;
        el.dataset.ygShown = '1';
        if (stagger) {
          const sibs = Array.from(el.parentElement ? el.parentElement.children : []);
          const i = Math.min(sibs.indexOf(el), 5);
          el.style.transitionDelay = (i > 0 ? i * 55 : 0) + 'ms';
        }
        el.style.opacity = '1';
        el.style.transform = 'none';
        live = true;
      };
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          show(e.target, true);
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      els.forEach(el => io.observe(el));
      // Synchronous first pass: anything already in view reveals immediately,
      // regardless of whether the observer ever delivers an entry.
      const sweep = () => {
        let any = false;
        els.forEach(el => {
          if (el.dataset.ygShown) { any = true; return; }
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.96 && r.bottom > 0) { show(el, true); io.unobserve(el); any = true; }
        });
        return any;
      };
      requestAnimationFrame(sweep);
      window.addEventListener('scroll', sweep, { passive: true });
      window.addEventListener('resize', sweep);
      // Safety net: if nothing has revealed after 2.5s, force everything visible.
      // Failsafe: only rescue elements that are on screen right now, and only if
      // the observer has never delivered. Off-screen elements stay observed.
      setTimeout(() => {
        if (live) return;
        els.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.style.transitionDelay = '0ms';
            show(el, true);
            io.unobserve(el);
          }
        });
      }, 2500);
    }

    // card hover lift
    document.querySelectorAll('[data-yg-card]').forEach(c => {
      c.addEventListener('mouseenter', () => {
        if (reduce) return;
        c.style.transform = 'translateY(-4px)';
        c.style.boxShadow = 'var(--shadowLift)';
        c.style.borderColor = 'var(--ruleStrong)';
      });
      c.addEventListener('mouseleave', () => {
        c.style.transform = '';
        c.style.boxShadow = 'var(--shadow)';
        c.style.borderColor = 'var(--rule)';
      });
    });
    document.querySelectorAll('[data-yg-row]').forEach(r => {
      const arrow = r.querySelector('[data-yg-arrow]');
      r.addEventListener('mouseenter', () => {
        r.style.background = 'color-mix(in srgb, var(--signal) 5%, transparent)';
        if (arrow) arrow.style.transform = 'translateX(6px)';
      });
      r.addEventListener('mouseleave', () => {
        r.style.background = '';
        if (arrow) arrow.style.transform = '';
      });
    });

    this.maskHeadings(reduce, motion);
    this.pinTrack(reduce);

    this._reduce = reduce;
    this._motion = motion;
    this._touch = window.matchMedia('(hover:none)').matches;
    this.watchTier();
    this.sectionRail();
    this.introVeil();
    this.startHero();
    this.startSpot();
    this.startSvd();
    this.startMini();
    this.countUp();
    this.backToTop();
  }

  // Writing section: a ring of dots under one matrix, factored.
  // Vt rotates, Sigma stretches, U rotates. Forward, hold, and back, forever.
  startSvd() {
    const cv = document.querySelector('[data-yg-svd]');
    if (!cv) return;
    let state = this.fit(cv);
    const label = document.querySelector('[data-yg-svd-stage]');
    const N = window.innerWidth <= 700 ? 52 : 84;
    const thV = -0.62, thU = 0.95, s1 = 1.72, s2 = 0.44;
    // Stage windows over a 0..1 cycle: rotate, stretch, rotate, hold, then reverse.
    const D = { a: 0.24, b: 0.26, c: 0.24, hold: 0.26 };
    const ease = (u) => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    const names = ['V\u1d40 \u00b7 rotate', '\u03a3 \u00b7 stretch', 'U \u00b7 rotate', 'A \u00b7 the ellipse'];
    const period = this._reduce ? 0 : 26000 / Math.max(0.25, 0.35 + (this._motion / 100) * 0.9);
    const t0 = performance.now();
    let lastName = '';

    const draw = (now) => {
      const { ctx, w, h } = state;
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.26;
      let a = 1, b = 1, c = 1, stage = 3;
      if (period > 0) {
        const loop = ((now - t0) % (period * 2)) / period;
        const f = loop < 1 ? loop : 2 - loop;      // 0..1..0, symmetric return
        if (f < D.a) { a = f / D.a; b = 0; c = 0; stage = 0; }
        else if (f < D.a + D.b) { a = 1; b = (f - D.a) / D.b; c = 0; stage = 1; }
        else if (f < D.a + D.b + D.c) { a = 1; b = 1; c = (f - D.a - D.b) / D.c; stage = 2; }
        else { a = 1; b = 1; c = 1; stage = 3; }
        if (loop > 1) stage = Math.min(stage, 2);
        a = ease(a); b = ease(b); c = ease(c);
      }
      const av = thV * a, sx = 1 + (s1 - 1) * b, sy = 1 + (s2 - 1) * b, au = thU * c;
      const map = (x, y) => {
        let px = x * Math.cos(av) - y * Math.sin(av);
        let py = x * Math.sin(av) + y * Math.cos(av);
        px *= sx; py *= sy;
        return [px * Math.cos(au) - py * Math.sin(au), px * Math.sin(au) + py * Math.cos(au)];
      };

      ctx.clearRect(0, 0, w, h);
      const sig = this.css('--signalOnDark');

      // reference: the untouched unit circle
      ctx.strokeStyle = 'rgba(245,243,238,.10)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(245,243,238,.06)';
      ctx.beginPath(); ctx.moveTo(cx - R * 2.2, cy); ctx.lineTo(cx + R * 2.2, cy);
      ctx.moveTo(cx, cy - R * 2.2); ctx.lineTo(cx, cy + R * 2.2); ctx.stroke();

      // the two singular directions, drawn as they currently sit
      ctx.strokeStyle = 'rgba(49,181,135,.28)'; ctx.lineWidth = 1;
      [[1, 0], [0, 1]].forEach(([ux, uy]) => {
        const [ex, ey] = map(ux * R, uy * R);
        ctx.beginPath(); ctx.moveTo(cx - ex, cy - ey); ctx.lineTo(cx + ex, cy + ey); ctx.stroke();
      });

      // the outline the dots are riding
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const th = (i / 120) * Math.PI * 2;
        const [ex, ey] = map(Math.cos(th) * R, Math.sin(th) * R);
        i === 0 ? ctx.moveTo(cx + ex, cy + ey) : ctx.lineTo(cx + ex, cy + ey);
      }
      ctx.strokeStyle = 'rgba(245,243,238,.18)'; ctx.lineWidth = 1; ctx.stroke();

      for (let i = 0; i < N; i++) {
        const th = (i / N) * Math.PI * 2;
        const [ex, ey] = map(Math.cos(th) * R, Math.sin(th) * R);
        const on = i % 7 === 0;
        ctx.beginPath();
        ctx.arc(cx + ex, cy + ey, on ? 2.6 : 1.7, 0, Math.PI * 2);
        ctx.fillStyle = on ? sig : 'rgba(245,243,238,.62)';
        ctx.globalAlpha = on ? 0.95 : 0.7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (label && names[stage] !== lastName) { lastName = names[stage]; label.textContent = names[stage]; }
    };

    const safeDraw = (now) => { try { draw(now); } catch (e) { console.warn('svd', e); } };
    const visible = () => this.shown(cv, 80);
    const loop = (now) => { if (visible()) safeDraw(now); requestAnimationFrame(loop); };
    safeDraw(performance.now());
    requestAnimationFrame(loop);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { state = this.fit(cv); }, 160);
    });
  }

  // The veil and the hero panel are the same dark slab: instead of fading out,
  // the veil contracts to the panel's exact rect, then cross-fades away.
  // Tier is read from the same breakpoints the stylesheet uses, so JS never
  // disagrees with CSS about what is on screen. Canvases hidden by a media
  // query report offsetParent === null, which is what gates every draw loop.
  watchTier() {
    const set = () => {
      const w = window.innerWidth;
      this._tier = w <= 700 ? 'sm' : w < 1600 ? 'md' : 'lg';
    };
    set();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(set, 120); });
  }

  // A rect alone is not enough: display:none reports 0,0, which reads as
  // "at the top of the viewport" and keeps a hidden canvas painting forever.
  shown(el, pad) {
    if (el.offsetParent === null) return false;
    const r = el.getBoundingClientRect();
    const p = pad || 80;
    return r.bottom > -p && r.top < window.innerHeight + p;
  }

  // Wide screens only: the section index lives in the gutter the layout was
  // already leaving empty. It reflects position, it does not add content.
  sectionRail() {
    const rail = document.querySelector('[data-r="rail"]');
    if (!rail) return;
    const links = Array.from(rail.querySelectorAll('[data-rail]'));
    const targets = links.map(a => document.querySelector(a.getAttribute('href')));
    const paint = (i) => links.forEach((a, n) => {
      const on = n === i;
      a.style.color = on ? 'var(--ink)' : 'var(--inkFaint)';
      const tick = a.querySelector('[data-rail-tick]');
      if (tick) { tick.style.width = on ? '30px' : '13px'; tick.style.background = on ? 'var(--signal)' : 'currentColor'; }
    });
    const sync = () => {
      if (rail.offsetParent === null) return;
      const line = window.innerHeight * 0.42;
      let cur = -1;
      targets.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= line) cur = i; });
      paint(cur);
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  introVeil() {
    const veil = document.querySelector('[data-yg-intro]');
    if (!veil) return;
    const panel = document.querySelector('[data-yg-panel]');
    if (this._reduce || !panel || !veil.animate) { veil.style.display = 'none'; return; }
    requestAnimationFrame(() => {
      const r = panel.getBoundingClientRect();
      const radius = getComputedStyle(panel).borderTopLeftRadius || '20px';
      const t = Math.max(0, r.top), l = Math.max(0, r.left);
      const b = Math.max(0, window.innerHeight - r.bottom), rt = Math.max(0, window.innerWidth - r.right);
      veil.animate([
        { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        { clipPath: 'inset(' + t + 'px ' + rt + 'px ' + b + 'px ' + l + 'px round ' + radius + ')' }
      ], { duration: 1000, delay: 1250, easing: 'cubic-bezier(.66,0,.24,1)', fill: 'both' });
      const out = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, delay: 2320, easing: 'ease-out', fill: 'forwards' });
      out.onfinish = () => { veil.style.display = 'none'; };
    });
  }

  // Section headings wipe up behind their own baseline as they enter.
  maskHeadings(reduce, motion) {
    const els = Array.from(document.querySelectorAll('[data-yg-mask]'));
    if (!els.length) return;
    if (reduce || motion === 0) return;
    const hide = (el) => {
      el.style.clipPath = 'inset(0 0 102% 0)';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'clip-path 1.05s cubic-bezier(.16,.84,.24,1), transform 1.05s cubic-bezier(.16,.84,.24,1)';
    };
    const show = (el) => {
      if (el.dataset.ygMasked) return;
      el.dataset.ygMasked = '1';
      el.style.clipPath = 'inset(-14% 0 -14% 0)';
      el.style.transform = 'none';
    };
    els.forEach(hide);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    els.forEach(el => io.observe(el));
    const sweep = () => els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) show(el);
    });
    requestAnimationFrame(sweep);
    window.addEventListener('scroll', sweep, { passive: true });
    setTimeout(() => {
      if (els.some(el => el.dataset.ygMasked)) return;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { show(el); io.unobserve(el); }
      });
    }, 2500);
  }

  // The AdverSec pipeline: on wide screens the section pins and the five stages
  // travel horizontally with the scroll. Narrow screens keep the native swipe row.
  // The pipeline holds the page: once the section sits at centre screen, wheel
  // gestures advance the stage column one stage at a time instead of scrolling.
  // After the last stage the page scrolls on. No runway, so no empty space.
  pinTrack(reduce) {
    const wrap = document.querySelector('[data-yg-pin]');
    if (!wrap) return;
    const win = wrap.querySelector('[data-yg-pin-window]');
    const track = wrap.querySelector('[data-yg-pin-track]');
    const side = wrap.querySelector('[data-yg-pin-side]');
    const bar = wrap.querySelector('[data-yg-pin-bar]');
    const rail = wrap.querySelector('[data-yg-pin-rail]');
    const count = wrap.querySelector('[data-yg-pin-count]');
    if (!win || !track) return;
    const cards = Array.from(track.children);
    const steps = cards.length;
    let idx = 0, step = 0, active = false, accum = 0, cool = 0;

    const off = () => {
      active = false;
      win.style.height = '';
      win.style.overflow = '';
      track.style.transform = '';
      track.style.transition = '';
      track.style.paddingTop = '';
      track.style.paddingBottom = '';
      cards.forEach(c => { c.style.minHeight = ''; c.style.display = ''; c.style.flexDirection = ''; c.style.justifyContent = ''; });
      if (rail) rail.style.display = 'none';
    };
    const paint = () => {
      track.style.transform = 'translate3d(0,' + (-idx * step) + 'px,0)';
      if (bar) bar.style.width = (18 + (idx / (steps - 1)) * 82) + '%';
      if (count) count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(steps).padStart(2, '0');
    };
    const layout = () => {
      const noWheel = window.matchMedia('(hover:none)').matches && !('onwheel' in window);
      if (reduce || window.innerWidth < 900 || noWheel) { off(); return; }
      const boxH = Math.max(300, side ? side.offsetHeight : 320);
      const cardH = Math.max(150, boxH - 84);
      cards.forEach(c => {
        c.style.minHeight = cardH + 'px';
        c.style.display = 'flex';
        c.style.flexDirection = 'column';
        c.style.justifyContent = 'center';
      });
      const pad = Math.round((boxH - cardH) / 2);
      track.style.paddingTop = pad + 'px';
      track.style.paddingBottom = pad + 'px';
      win.style.height = boxH + 'px';
      win.style.overflow = 'hidden';
      track.style.transition = 'transform .62s cubic-bezier(.22,.78,.2,1)';
      const gap = parseFloat(getComputedStyle(track).rowGap) || 14;
      step = cardH + gap;
      if (rail) rail.style.display = 'flex';
      active = true;
      paint();
    };
    const centred = () => {
      const r = wrap.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      return Math.abs(mid - window.innerHeight / 2) < Math.max(90, window.innerHeight * 0.2);
    };
    const onWheel = (e) => {
      if (!active || e.ctrlKey) return;
      const down = e.deltaY > 0;
      if (down && idx >= steps - 1) return;
      if (!down && idx <= 0) return;
      if (!centred()) return;
      e.preventDefault();
      const now = Date.now();
      if (now < cool) return;
      accum += e.deltaY;
      if (Math.abs(accum) < 34) return;
      idx = Math.min(steps - 1, Math.max(0, idx + (accum > 0 ? 1 : -1)));
      accum = 0;
      cool = now + 520;
      paint();
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    // Touch: the same one-stage-per-gesture advance.
    let touchY = null;
    window.addEventListener('touchstart', (e) => {
      touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!active || touchY === null) return;
      const dy = touchY - e.touches[0].clientY;
      const down = dy > 0;
      if ((down && idx >= steps - 1) || (!down && idx <= 0)) return;
      if (!centred()) return;
      e.preventDefault();
      const now = Date.now();
      if (now < cool || Math.abs(dy) < 26) return;
      idx = Math.min(steps - 1, Math.max(0, idx + (down ? 1 : -1)));
      touchY = e.touches[0].clientY;
      cool = now + 520;
      paint();
    }, { passive: false });

    // Keyboard: arrows, space and page keys step through the stages.
    window.addEventListener('keydown', (e) => {
      if (!active) return;
      const fwd = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!fwd && !back) return;
      if ((fwd && idx >= steps - 1) || (back && idx <= 0)) return;
      if (!centred()) return;
      e.preventDefault();
      idx = Math.min(steps - 1, Math.max(0, idx + (fwd ? 1 : -1)));
      paint();
    });

    window.addEventListener('resize', layout);
    requestAnimationFrame(layout);
    setTimeout(layout, 400);
  }

  css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
  }

  fit(cv) {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  // Hero: signal intelligence. A sparse network drifts and observes itself.
  // Pulses travel between nodes; every few seconds one takes an unusual path,
  // the network converges on it, a detection pulse catches it, and things settle.
  startHero() {
    const cv = document.querySelector('[data-yg-canvas]');
    if (!cv) return;
    let state = this.fit(cv);
    const rate = this._reduce ? 0 : 0.4 + (this._motion / 100) * 0.8;
    const GREEN = '#5CCFA5', AMBER = '#E0AC4E';
    let nodes = [], dust = [], pulses = [], phase = 'idle', pt = 0, conv = 0, det = null;
    let mx = -999, my = -999, near = 0, prev = performance.now();

    const build = () => {
      const { w, h } = state;
      const n = 7;
      nodes = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.4;
        const rr = Math.min(w, h) * (i === 0 ? 0.06 : 0.3 + (i % 3) * 0.07);
        nodes.push({
          hx: w / 2 + Math.cos(a) * rr * 1.25, hy: h / 2 + Math.sin(a) * rr,
          x: 0, y: 0, ph: Math.random() * 6.283, lit: 0, r: 2.6 + (i % 2) * 1.1
        });
      }
      nodes.forEach(nd => { nd.x = nd.hx; nd.y = nd.hy; });
      dust = [];
      const dn = Math.max(30, Math.min(50, Math.round(w * h / 7000)));
      for (let i = 0; i < dn; i++) {
        dust.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, r: 0.7 + Math.random() * 1.1, a: 0.2 + Math.random() * 0.35 });
      }
      pulses = []; phase = 'idle'; pt = 0; conv = 0; det = null;
    };
    build();

    const spawn = (odd) => {
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * nodes.length);
      if (b === a) b = (a + 2) % nodes.length;
      const path = odd ? [a, (a + 3) % nodes.length, (a + 5) % nodes.length, b] : [a, b];
      pulses.push({ path, seg: 0, u: 0, odd: !!odd, dead: false, v: odd ? 0.5 : 0.75 + Math.random() * 0.5 });
    };

    cv.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });
    cv.addEventListener('pointerenter', () => { near = 1; });
    cv.addEventListener('pointerleave', () => { near = 0; mx = -999; my = -999; });
    cv.addEventListener('pointerdown', () => { conv = Math.max(conv, 0.7); spawn(false); spawn(false); });

    const paint = (now) => {
      const { ctx, w, h } = state;
      const dt = Math.min(0.05, (now - prev) / 1000) * rate;
      prev = now;
      const t = now / 1000 * rate;
      ctx.clearRect(0, 0, w, h);

      // the story runs on its own clock: quiet, then an anomaly, then resolution
      pt += dt;
      if (phase === 'idle' && pt > 6) { phase = 'anomaly'; pt = 0; spawn(true); }
      else if (phase === 'anomaly' && pt > 2.6) { phase = 'detect'; pt = 0; conv = 1; }
      else if (phase === 'detect' && pt > 2.2) { phase = 'settle'; pt = 0; }
      else if (phase === 'settle' && pt > 2.4) { phase = 'idle'; pt = 0; }
      conv = Math.max(0, conv - dt * (phase === 'detect' ? 0.18 : 0.45));
      if (Math.random() < dt * (0.7 + near * 1.1)) spawn(false);

      // nodes drift around home, and lean toward centre while converging
      const cxc = w / 2, cyc = h / 2;
      for (const nd of nodes) {
        const dx = Math.sin(t * 0.19 + nd.ph) * 11, dy = Math.cos(t * 0.15 + nd.ph * 1.3) * 11;
        const tx = nd.hx + dx + (cxc - nd.hx) * conv * 0.3;
        const ty = nd.hy + dy + (cyc - nd.hy) * conv * 0.3;
        nd.x += (tx - nd.x) * Math.min(1, dt * 1.6);
        nd.y += (ty - nd.y) * Math.min(1, dt * 1.6);
        nd.lit = Math.max(0, nd.lit - dt * 1.4);
      }

      // dust: slow drift, a small lean away from the cursor
      for (const p of dust) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (mx > -50) {
          const ddx = p.x - mx, ddy = p.y - my, d2 = ddx * ddx + ddy * ddy;
          if (d2 < 12000 && d2 > 1) {
            const f = (1 - d2 / 12000) * 26 * dt;
            p.x += (ddx / Math.sqrt(d2)) * f; p.y += (ddy / Math.sqrt(d2)) * f;
          }
        }
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        ctx.globalAlpha = p.a * (0.6 + near * 0.4);
        ctx.fillStyle = '#9AA3AC';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      // connections: thin, and a little more awake while the pointer is inside
      const maxD = Math.min(w, h) * 0.62;
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > maxD) continue;
          const base = (1 - d / maxD) * (0.16 + near * 0.14 + conv * 0.2);
          ctx.globalAlpha = base;
          ctx.strokeStyle = GREEN;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // pulses travelling the network
      pulses = pulses.filter(P => {
        const a = nodes[P.path[P.seg]], b = nodes[P.path[P.seg + 1]];
        if (!b) return false;
        P.u += dt * P.v;
        if (P.u >= 1) {
          P.u = 0; P.seg++;
          const nx = nodes[P.path[P.seg]];
          if (nx) nx.lit = 1;
          if (P.seg >= P.path.length - 1) return false;
        }
        const cur = nodes[P.path[P.seg]], nxt = nodes[P.path[P.seg + 1]];
        if (!cur || !nxt) return false;
        const x = cur.x + (nxt.x - cur.x) * P.u, y = cur.y + (nxt.y - cur.y) * P.u;
        const col = P.odd ? AMBER : GREEN;
        ctx.globalAlpha = P.odd ? 0.3 : 0.16;
        ctx.strokeStyle = col; ctx.lineWidth = P.odd ? 1.3 : 1;
        ctx.beginPath(); ctx.moveTo(cur.x, cur.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = P.odd ? 0.95 : 0.7;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, P.odd ? 2.6 : 1.9, 0, Math.PI * 2); ctx.fill();
        if (P.odd && phase === 'detect' && !det) det = { x, y, r: 0, life: 0 };
        return true;
      });
      if (phase === 'detect' && !pulses.some(P => P.odd) && !det) det = { x: cxc, y: cyc, r: 0, life: 0 };
      if (phase === 'idle' || phase === 'settle') pulses = pulses.filter(P => !P.odd);

      // the detection: one contained ring, no label
      if (det) {
        det.life += dt;
        det.r = det.life * 90;
        ctx.globalAlpha = Math.max(0, 0.5 - det.life * 0.42);
        ctx.strokeStyle = GREEN; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(det.x, det.y, det.r, 0, Math.PI * 2); ctx.stroke();
        if (det.life > 1.3) det = null;
      }

      for (const nd of nodes) {
        const glow = 0.1 + nd.lit * 0.45 + conv * 0.2;
        ctx.globalAlpha = glow * 0.5;
        ctx.fillStyle = GREEN;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r + 6 + nd.lit * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.55 + nd.lit * 0.45;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (this._touch) {
      // No cursor will ever arrive here, so the reactive layer would sit dead.
      // Give the field its own slow observer instead.
      const t0 = performance.now();
      const drift = (now) => {
        const { w, h } = state;
        const s = (now - t0) / 1000;
        mx = w * (0.5 + 0.34 * Math.sin(s * 0.21));
        my = h * (0.5 + 0.3 * Math.sin(s * 0.29 + 1.1));
        near = 0.55;
        requestAnimationFrame(drift);
      };
      requestAnimationFrame(drift);
    }

    const visible = () => this.shown(cv, 100);
    const loop = (now) => {
      if (visible()) { try { paint(now); } catch (e) { console.warn('hero', e); } } else { prev = now; }
      requestAnimationFrame(loop);
    };
    try { paint(performance.now()); } catch (e) { console.warn('hero', e); }
    requestAnimationFrame(loop);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { state = this.fit(cv); build(); }, 160);
    });
  }

  // Back to top: available from anywhere, out of the way until there is something to go back to.
  backToTop() {
    const btn = document.querySelector('[data-yg-top]');
    if (!btn) return;
    const show = (on) => {
      btn.style.opacity = on ? '1' : '0';
      btn.style.transform = on ? 'none' : 'translateY(10px)';
      btn.style.pointerEvents = on ? 'auto' : 'none';
    };
    // the host may own scrolling, so watch a sentinel rather than window.scrollY
    let top = document.querySelector('[data-yg-sentinel]');
    if (!top) {
      top = document.createElement('div');
      top.setAttribute('data-yg-sentinel', '');
      top.style.cssText = 'height:1px;margin-bottom:-1px;pointer-events:none';
      document.body.prepend(top);
    }
    let last = null;
    const sync = () => {
      const off = top ? -top.getBoundingClientRect().top : window.scrollY;
      const on = off > window.innerHeight * 0.5;
      if (on !== last) { last = on; show(on); }
    };
    sync();
    setInterval(sync, 200);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    btn.addEventListener('click', () => {
      const smooth = this._reduce ? 'auto' : 'smooth';
      const before = window.scrollY;
      window.scrollTo({ top: 0, behavior: smooth });
      const el = document.getElementById('top');
      if (el && el.scrollIntoView) {
        requestAnimationFrame(() => {
          if (window.scrollY === before && before !== 0) el.scrollIntoView({ behavior: smooth, block: 'start' });
        });
      }
      let n = top;
      while (n && n !== document.body) {
        const ov = getComputedStyle(n).overflowY;
        if ((ov === 'auto' || ov === 'scroll') && n.scrollHeight > n.clientHeight + 40) { n.scrollTo({ top: 0, behavior: smooth }); break; }
        n = n.parentElement;
      }
      if (document.scrollingElement) document.scrollingElement.scrollTo({ top: 0, behavior: smooth });
    });
  }

  // Experience figures count up from zero the first time they are seen.
  countUp() {
    const els = Array.from(document.querySelectorAll('[data-yg-count]'));
    if (!els.length) return;
    els.forEach(el => {
      const raw = el.textContent;
      const parts = raw.split(/(\d+)/);
      if (!parts.some(p => /^\d+$/.test(p))) return;
      el.dataset.ygRaw = raw;
      if (this._reduce) return;
      el.textContent = parts.map(p => (/^\d+$/.test(p) ? '0' : p)).join('');
    });
    const run = (el) => {
      if (el.dataset.ygRan) return;
      el.dataset.ygRan = '1';
      const raw = el.dataset.ygRaw;
      if (!raw || this._reduce) return;
      const parts = raw.split(/(\d+)/);
      const dur = 2400, t0 = performance.now();
      const tick = (now) => {
        const u = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - u, 4);
        el.textContent = parts.map(p => (/^\d+$/.test(p) ? String(Math.round(Number(p) * e)) : p)).join('');
        if (u < 1) requestAnimationFrame(tick); else el.textContent = raw;
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.2 });
    els.forEach(el => io.observe(el));
    const sweep = () => els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) run(el);
    });
    requestAnimationFrame(sweep);
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    // nothing may be left reading zero: restore the real figures either way
    setTimeout(() => {
      els.forEach(el => { if (!el.dataset.ygRan && el.dataset.ygRaw) el.textContent = el.dataset.ygRaw; });
    }, 4000);
  }

  // Selected work: the spotlight rotates through the six projects, and each one
  // carries a figure that never resolves - it keeps running for as long as it is shown.
  startSpot() {
    const wrap = document.querySelector('[data-yg-spot]');
    if (!wrap) return;
    const panels = Array.from(wrap.querySelectorAll('[data-yg-spot-panel]'));
    if (!panels.length) return;
    const dots = wrap.querySelector('[data-yg-spot-dots]');
    const bar = wrap.querySelector('[data-yg-spot-bar]');
    const count = wrap.querySelector('[data-yg-spot-count]');
    const HOLD = 9000;
    let idx = 0, hold = 0, paused = false;

    panels.forEach((p, i) => {
      p.style.transition = 'opacity .7s cubic-bezier(.2,.7,.3,1), transform .7s cubic-bezier(.2,.7,.3,1)';
      p.style.opacity = i === 0 ? '1' : '0';
      p.style.transform = i === 0 ? 'none' : 'translateY(12px)';
      p.style.pointerEvents = i === 0 ? '' : 'none';
    });
    const btns = panels.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show project ' + (i + 1));
      b.style.cssText = 'width:7px;height:7px;padding:0;border:0;border-radius:50%;cursor:pointer;background:var(--ruleStrong);transition:background .3s, transform .3s';
      b.addEventListener('click', (e) => { e.preventDefault(); go(i); hold = 0; });
      if (dots) dots.appendChild(b);
      return b;
    });

    const go = (n) => {
      idx = (n + panels.length) % panels.length;
      panels.forEach((p, i) => {
        const on = i === idx;
        p.style.opacity = on ? '1' : '0';
        p.style.transform = on ? 'none' : 'translateY(12px)';
        p.style.pointerEvents = on ? '' : 'none';
      });
      btns.forEach((b, i) => {
        b.style.background = i === idx ? 'var(--signal)' : 'var(--ruleStrong)';
        b.style.transform = i === idx ? 'scale(1.35)' : 'none';
      });
      if (count) count.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
    };
    go(0);

    wrap.addEventListener('mouseenter', () => { paused = true; });
    wrap.addEventListener('mouseleave', () => { paused = false; });
    wrap.addEventListener('focusin', () => { paused = true; });
    wrap.addEventListener('focusout', () => { paused = false; });

    // Touch has no hover to pause on and no dot small enough to aim at reliably,
    // so the panel itself becomes the control. A horizontal drag past 46px
    // advances; anything shorter or steeper stays a tap on the link.
    let sx = 0, sy = 0, dragging = false, swiped = false;
    wrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      sx = e.clientX; sy = e.clientY; dragging = true; swiped = false; paused = true;
    }, { passive: true });
    wrap.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false; paused = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        swiped = true;
        go(idx + (dx < 0 ? 1 : -1));
        hold = 0;
      }
    });
    // preventDefault on pointerup does not cancel the click that follows, and
    // every panel is an anchor: without this the swipe would navigate away.
    wrap.addEventListener('click', (e) => {
      if (!swiped) return;
      e.preventDefault(); e.stopPropagation(); swiped = false;
    }, true);
    wrap.addEventListener('pointercancel', () => { dragging = false; swiped = false; paused = false; });

    const figs = Array.from(wrap.querySelectorAll('[data-yg-fig]')).map(cv => ({
      cv, key: cv.getAttribute('data-yg-fig'), state: this.fit(cv), mem: {}
    }));
    const speed = this._reduce ? 0 : 0.45 + (this._motion / 100) * 1.1;

    let prev = performance.now();
    const visible = () => this.shown(wrap, 100);
    const frame = (now) => {
      const dt = Math.min(64, now - prev);
      prev = now;
      if (visible()) {
        if (!paused && !this._reduce && panels.length > 1) {
          hold += dt;
          if (hold >= HOLD) { hold = 0; go(idx + 1); }
        }
        if (bar) bar.style.width = (this._reduce ? 100 : (hold / HOLD) * 100) + '%';
        const f = figs[idx];
        if (f) {
          try { this.fig(f, now * 0.001 * speed, dt * 0.001 * speed); }
          catch (e) { console.warn('fig', f.key, e); }
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { figs.forEach(f => { f.state = this.fit(f.cv); f.mem = {}; }); }, 160);
    });
  }

  // What I do: one small living figure per card. Each stays inside its card,
  // moves slowly, and explains the sentence above it without adding a word.
  startMini() {
    const list = Array.from(document.querySelectorAll('[data-yg-mini]'));
    if (!list.length) return;
    const items = list.map(cv => ({ cv, key: cv.getAttribute('data-yg-mini'), state: this.fit(cv), mem: {} }));
    const rate = this._reduce ? 0 : 0.4 + (this._motion / 100) * 0.8;
    let prev = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000) * rate;
      prev = now;
      for (const it of items) {
        if (!this.shown(it.cv, 60)) continue;
        try { this.mini(it, now / 1000 * rate, dt); } catch (e) { console.warn('mini', it.key, e); }
      }
      requestAnimationFrame(step);
    };
    for (const it of items) { try { this.mini(it, 0, 0); } catch (e) { console.warn('mini', it.key, e); } }
    requestAnimationFrame(step);
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { items.forEach(it => { it.state = this.fit(it.cv); it.mem = {}; }); }, 160);
    });
  }

  // Figure drawing lives in figures.js. Guarded so a slow or blocked load
  // simply skips a frame rather than throwing inside the animation loop.
  mini(it, t, dt) {
    const F = window.YGFigures;
    if (F) F.mini.call(this, it, t, dt);
  }

  fig(f, t, dt) {
    const F = window.YGFigures;
    if (F) F.fig.call(this, f, t, dt);
  }

  renderVals() { return {}; }
}


Page.prototype.setState = function (p) { this.state = Object.assign({}, this.state, typeof p === 'function' ? p(this.state) : p); };
Page.prototype.forceUpdate = function () {};
var boot = function () {
  var c = new Page();
  c.props = {"theme":"light","accent":"#0E8A5F","motion":55};
  c.state = {};
  try { c.componentDidMount(); } catch (e) { console.error('boot', e); }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
