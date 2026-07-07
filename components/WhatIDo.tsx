// The scannable "what I do" summary — three focus areas, one discipline.
// Editorial content (a designed summary), intentionally not Notion-driven.
const AREAS = [
  {
    no: '01',
    title: 'Security operations',
    body: 'SOC work, SIEM tuning, incident response and vulnerability management on real production estates.',
    tags: 'ISO 27001 · SIEM · IR · VAPT',
  },
  {
    no: '02',
    title: 'Intrusion detection',
    body: 'Network defence and IDS/IDPS — from Suricata gateways to deep-learning detectors.',
    tags: 'Suricata · Nmap · UFW · Flask',
  },
  {
    no: '03',
    title: 'AI security & research',
    body: 'Adversarial machine learning — hardening detection models against attacks designed to fool them.',
    tags: 'PyTorch · ART · CAN bus',
  },
];

export default function WhatIDo() {
  return (
    <section id="approach" className="band">
      <div className="container">
        <header className="section-head reveal">
          <span className="eyebrow">What I do</span>
          <h2 className="section-head__title">Three things, one discipline.</h2>
        </header>
        <div className="do reveal">
          {AREAS.map((a) => (
            <div className="do__col" key={a.no}>
              <div className="do__pre">{a.no}</div>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <div className="do__tags">{a.tags}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
