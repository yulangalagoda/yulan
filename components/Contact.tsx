import { splitHighlights } from '@/lib/richtext';
import type { ProfileRow, SocialLinkRow } from '@/lib/types';

interface Props {
  contact?: ProfileRow;
  socials?: SocialLinkRow[];
  email?: string;
  cvPath?: string | null;
}

const FALLBACK =
  'Open to security engineering, SOC and detection engineering, and AI-security roles. UK, remote, or relocation for the right team.';

export default function Contact({ contact, socials = [], email, cvPath }: Props) {
  const addr = email || 'hi@yulan.me';
  const lead = splitHighlights(contact?.content?.trim() || FALLBACK)
    .filter((l) => !/^(email|location)\s*:/i.test(l.trim()))[0] || FALLBACK;

  const links = socials.filter(
    (s) => s.url && s.url.trim() && !s.url.trim().toLowerCase().startsWith('mailto:')
  );

  return (
    <section className="rg-sec rg-contact" id="contact">
      <div className="container reveal">
        <span className="eyebrow rg-up">Contact</span>
        <h2><span className="rg-lift rg-d1"><span>Let&rsquo;s talk.</span></span></h2>
        <p className="rg-contact__lead rg-up rg-d2">{lead}</p>

        <a className="rg-mail rg-up rg-d3" href={`mailto:${addr}`}>{addr}</a>

        <p className="rg-contact__avail rg-up rg-d4">
          <span className="rg-dot" aria-hidden="true"></span>
          Available in Sri Lanka &amp; the United Kingdom
        </p>

        <div className="rg-pills rg-up rg-d5">
          {cvPath && (
            <a className="rg-pill" href={cvPath} target="_blank" rel="noopener noreferrer">Download CV</a>
          )}
          {links.map((s) => (
            <a className="rg-pill" key={s.id} href={s.url} target="_blank" rel="noopener noreferrer me">
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
