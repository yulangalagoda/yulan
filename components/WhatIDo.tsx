// The scannable "what I do" summary: three focus areas, one discipline. The
// left column pins while the list advances, so reading sets the pace.
const AREAS = [
  {
    n: '01',
    title: 'Security operations',
    body: 'SOC work, SIEM tuning, incident response and vulnerability management on real production estates.',
    tags: 'ISO 27001 · Sentinel · Defender XDR · VAPT',
  },
  {
    n: '02',
    title: 'Intrusion detection',
    body: 'Network defence and IDS/IDPS, from Suricata gateways to deep-learning detectors.',
    tags: 'Suricata · Nmap · UFW · Flask',
  },
  {
    n: '03',
    title: 'AI security & research',
    body: 'Adversarial machine learning, hardening detection models against attacks designed to fool them.',
    tags: 'PyTorch · ART · CAN bus',
  },
];

export default function WhatIDo() {
  return (
    <section className="rg-sec" id="do">
      <div className="container rg-split">
        <div className="rg-split__pin reveal">
          <span className="eyebrow rg-up">What I do</span>
          <h2>
            <span className="rg-lift rg-d1"><span>Three things,</span></span>
            <span className="rg-lift rg-d2"><span>one discipline.</span></span>
          </h2>
          <p className="rg-up rg-d3">
            Security operations and machine learning are usually treated as separate trades. I work
            where they meet.
          </p>
        </div>

        <div className="rg-stack reveal">
          {AREAS.map((a, i) => (
            <div className={`rg-row rg-up${i ? ` rg-d${i * 2}` : ''}`} key={a.n}>
              <span className="rg-row__n" aria-hidden="true">{a.n}</span>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <div className="rg-row__tags">{a.tags}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
