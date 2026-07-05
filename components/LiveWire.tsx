'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ScopePort {
  port: number;
  records: number;
}

/**
 * The hero's instrument panel, fed by live global threat telemetry from the
 * SANS Internet Storm Center (isc.sans.edu — free, CORS-enabled, no key).
 *
 * - The scope trace performs today's real attack mix; a trigger cursor
 *   "decodes" each pulse as it crosses, naming the service and attack type
 * - Top attacked port today across the ISC honeypot network
 * - A single running estimate of today's total hits, climbing at the real
 *   observed rate, with "since page load" derived from the SAME number so the
 *   two readouts can never contradict each other
 * - The ISC Infocon global threat level in the panel header
 *
 * The panel re-polls ISC periodically; when a new aggregate lands the running
 * count catches up to it (never steps backward). Everything degrades
 * gracefully: until data arrives (or if the API is down) the panel shows calm
 * placeholder readouts.
 */

const PORT_NAMES: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  80: 'HTTP',
  123: 'NTP',
  443: 'HTTPS',
  445: 'SMB',
  1433: 'MSSQL',
  2222: 'SSH-alt',
  3306: 'MySQL',
  3389: 'RDP',
  5060: 'SIP',
  5900: 'VNC',
  6379: 'Redis',
  8080: 'HTTP-alt',
};

// What an attack on each port usually is — the "decode" shown to visitors.
const PORT_ATTACKS: Record<number, string> = {
  21: 'legacy file-transfer probing',
  22: 'SSH password brute-force',
  23: 'IoT botnet recruitment scans',
  25: 'mail-relay abuse probes',
  80: 'web exploit scanning',
  123: 'NTP amplification probes',
  443: 'web exploit scanning',
  445: 'worm-style SMB propagation',
  1433: 'database brute-force',
  2222: 'SSH brute-force (alt port)',
  3306: 'database brute-force',
  3389: 'remote-desktop brute-force',
  5060: 'VoIP toll-fraud scans',
  5900: 'remote-screen hijack attempts',
  6379: 'database hijack attempts',
  8080: 'proxy & web-panel scanning',
};

const GENERIC_ATTACK = 'automated mass scanning';

interface Snapshot {
  topPort: number;
  topPortHits: number;
  totalHits: number;
  ratePerSec: number;
  infocon: string;
  /** Top ports arranged for the scope trace (peak centred). */
  tracePorts: ScopePort[];
  /** Top-5 ports ranked by volume, for the readable list. */
  ranked: ScopePort[];
  /** Sum of the ranked ports' records — the denominator for share %. */
  rankedTotal: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-GB');
}

async function fetchSnapshot(): Promise<Snapshot | null> {
  try {
    const [portsRes, infoconRes] = await Promise.all([
      fetch('https://isc.sans.edu/api/topports/records/5?json'),
      fetch('https://isc.sans.edu/api/infocon?json'),
    ]);
    if (!portsRes.ok) return null;
    const ports: any = await portsRes.json();
    const infocon: string = infoconRes.ok ? (await infoconRes.json())?.status ?? 'green' : 'green';

    const rows: ScopePort[] = [];
    for (const key of Object.keys(ports)) {
      const row = ports[key];
      if (row && typeof row === 'object' && typeof row.records === 'number' && typeof row.targetport === 'number') {
        rows.push({ port: row.targetport, records: row.records });
      }
    }
    if (rows.length === 0) return null;

    const top = rows.reduce((a, b) => (b.records > a.records ? b : a));
    const totalHits = rows.reduce((sum, r) => sum + r.records, 0);

    // Arrange the ranked ports so the tallest pulse sits mid-trace:
    // [rank 2, rank 4, rank 1, rank 5, rank 3].
    const rankedAll = [...rows].sort((a, b) => b.records - a.records);
    const tracePorts = [1, 3, 0, 4, 2]
      .map((i) => rankedAll[i])
      .filter((p): p is ScopePort => Boolean(p));
    const ranked = rankedAll.slice(0, 5);
    const rankedTotal = ranked.reduce((sum, r) => sum + r.records, 0) || 1;

    // Average observed rate so far today (UTC), from the real daily total.
    const now = new Date();
    const secondsToday = Math.max(
      1,
      (now.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 1000
    );
    return {
      topPort: top.port,
      topPortHits: top.records,
      totalHits,
      ratePerSec: totalHits / secondsToday,
      infocon,
      tracePorts,
      ranked,
      rankedTotal,
    };
  } catch {
    return null;
  }
}

const POLL_MS = 300_000; // re-check ISC every 5 min (their CDN caches ~10 min)
const STORE_KEY = 'lw_hits_v1';

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

// Persist the running total for today so a refresh resumes instead of snapping
// back to ISC's batch figure. Reset implicitly at UTC midnight (day key).
function readStored(): { total: number; at: number } | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && o.day === utcDay() && typeof o.total === 'number' && typeof o.at === 'number') {
      return { total: o.total, at: o.at };
    }
  } catch {
    /* localStorage unavailable (private mode) — fall back to live value */
  }
  return null;
}

function writeStored(total: number): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ day: utcDay(), total, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export default function LiveWire() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [hitsToday, setHitsToday] = useState(0);
  const [sinceLoad, setSinceLoad] = useState(0);

  // The running-count model. `hitsToday` and `sinceLoad` are both derived from
  // one displayed value (anchor + rate × elapsed), so they stay consistent.
  const loadBaseRef = useRef<number | null>(null); // displayed total when the page loaded
  const anchorTotalRef = useRef(0); // real total at the last poll (monotonic)
  const anchorAtRef = useRef(0); // performance.now() when the anchor was set
  const rateRef = useRef(0); // real attacks/sec
  const realTotalRef = useRef(0); // latest real ISC total

  // Fold a fresh snapshot into the running model without ever stepping back.
  const applySnapshot = useCallback((s: Snapshot) => {
    const now = performance.now();
    let baseline: number;
    if (anchorTotalRef.current > 0) {
      // Subsequent poll: continue the running value, catching up to real jumps.
      baseline = anchorTotalRef.current + rateRef.current * ((now - anchorAtRef.current) / 1000);
    } else {
      // First snapshot: resume today's persisted running total (carried forward
      // to now) so a refresh doesn't snap back to ISC's batched figure.
      const stored = readStored();
      baseline = stored
        ? stored.total + s.ratePerSec * ((Date.now() - stored.at) / 1000)
        : s.totalHits;
    }
    anchorTotalRef.current = Math.max(baseline, s.totalHits);
    anchorAtRef.current = now;
    rateRef.current = s.ratePerSec;
    realTotalRef.current = s.totalHits;
    if (loadBaseRef.current === null) loadBaseRef.current = anchorTotalRef.current;
    setSnap(s);
  }, []);

  // Initial fetch + periodic re-poll.
  useEffect(() => {
    let cancelled = false;
    const load = () => fetchSnapshot().then((s) => { if (!cancelled && s) applySnapshot(s); });
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [applySnapshot]);

  // Tick the displayed numbers from the single running value.
  useEffect(() => {
    if (!snap) return;
    let sinceWrite = 0;
    const id = setInterval(() => {
      const now = performance.now();
      const displayed = anchorTotalRef.current + rateRef.current * ((now - anchorAtRef.current) / 1000);
      setHitsToday(displayed);
      setSinceLoad(Math.max(0, displayed - (loadBaseRef.current ?? displayed)));
      // Persist the running total every ~3s so a refresh resumes from here.
      sinceWrite += 250;
      if (sinceWrite >= 3000) {
        sinceWrite = 0;
        writeStored(displayed);
      }
    }, 250);
    return () => clearInterval(id);
  }, [snap]);

  const infocon = (snap?.infocon ?? 'green').toUpperCase();
  const infoconAlert = infocon !== 'GREEN';
  const ranked = snap?.ranked ?? [];

  return (
    <aside className="panel wire" aria-label="Live global attack telemetry">
      <div className="panel__head">
        <span>CH-1 · Global attack traffic</span>
        <b className={infoconAlert ? 'alert' : ''}>Threat level ▌{infocon}</b>
      </div>

      <p className="wire__intro">
        <span className={`wire__dot${snap ? '' : ' is-idle'}`} aria-hidden="true" />
        {snap
          ? 'These are the ports the internet is attacking most right now — measured across a worldwide network of honeypot sensors.'
          : 'Connecting to the global honeypot network…'}
      </p>

      <div className="panel__ports">
        <div className="panel__ports-head">
          <span>Most-attacked ports today</span>
          <span>share of top&nbsp;5</span>
        </div>
        {ranked.length > 0 ? (
          <ol className="wire-ports">
            {ranked.map((p, i) => {
              const share = Math.round((p.records / (snap!.rankedTotal || 1)) * 100);
              return (
                <li key={p.port} className="wire-port">
                  <span className="wire-port__rank">{i + 1}</span>
                  <span className="wire-port__id">
                    <b>Port {p.port}{PORT_NAMES[p.port] ? ` · ${PORT_NAMES[p.port]}` : ''}</b>
                    <span className="wire-port__attack">{PORT_ATTACKS[p.port] ?? GENERIC_ATTACK}</span>
                  </span>
                  <span className="wire-port__bar" aria-hidden="true">
                    <span className="wire-port__fill" style={{ width: `${share}%` }} />
                  </span>
                  <span className="wire-port__share">{share}%</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="wire-ports__empty">Reading the wire…</p>
        )}
      </div>

      <div className="panel__readouts">
        <div>
          Attacks today
          <b>{snap ? fmt(hitsToday) : '—'}</b>
        </div>
        <div>
          Since you opened this
          <b>{snap ? `+${fmt(sinceLoad)}` : '—'}</b>
        </div>
        <div>
          Threat level
          <b className={infoconAlert ? 'alert' : ''}>{infocon}</b>
        </div>
      </div>
      <p className="panel__source">
        Live estimate · today&rsquo;s top-5 attacked ports accumulating at the observed rate —{' '}
        <a href="https://isc.sans.edu" target="_blank" rel="noopener noreferrer">
          SANS Internet Storm Center
        </a>{' '}
        honeypot network
      </p>
    </aside>
  );
}
