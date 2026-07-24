import { splitHighlights } from '@/lib/richtext';
import type { ProfileRow, SocialLinkRow } from '@/lib/types';

interface Props {
  contact?: ProfileRow;
  socials?: SocialLinkRow[];
  email?: string;
  cvPath?: string | null;
}

// Minimal inline icon set, keyed by the Notion row's Icon select (or Name).
const ICON_PATHS: Record<string, string> = {
  github:
    'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z',
  linkedin:
    'M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 9.25h3.96V21H3V9.25Zm6.59 0h3.8v1.6h.05c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.07V21h-3.96v-5.42c0-1.29-.02-2.96-1.8-2.96-1.8 0-2.08 1.41-2.08 2.86V21H9.59V9.25Z',
  twitter:
    'M17.53 3h3.01l-6.57 7.51L21.7 21h-6.05l-4.74-6.2L5.49 21h-3.02l7.03-8.03L2.3 3h6.2l4.28 5.66L17.53 3Zm-1.06 16.2h1.67L7.61 4.71H5.82L16.47 19.2Z',
  x: 'M17.53 3h3.01l-6.57 7.51L21.7 21h-6.05l-4.74-6.2L5.49 21h-3.02l7.03-8.03L2.3 3h6.2l4.28 5.66L17.53 3Z',
  instagram:
    'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.87 5.87 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13a5.87 5.87 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.13-1.38 5.87 5.87 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z',
  orcid:
    'M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.946-.422-.946-.947 0-.516.421-.947.946-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z',
};

function iconFor(row: SocialLinkRow): string | null {
  const key = (row.icon || row.name || '').toLowerCase().trim();
  return ICON_PATHS[key] ?? null;
}

function InlineLine({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return <a key={i} href={m[2]}>{m[1]}</a>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function Contact({ contact, socials = [], email, cvPath }: Props) {
  const addr = email || 'hi@yulan.me';
  const sub =
    contact?.content?.trim() ||
    'Whether you need an engineer on your team, a collaborator on research, or a consultant on a hard security problem, my inbox is open.';
  const subLines = splitHighlights(sub).filter((l) => !/^email\s*:/i.test(l.trim()));
  const links = socials.filter(
    (s) => s.url && s.url.trim().length > 0 && !s.url.trim().toLowerCase().startsWith('mailto:')
  );

  return (
    <section id="contact" className="contact band">
      <div className="container">
        <div className="contact__inner reveal">
          <span className="eyebrow">Contact</span>
          <h2 className="contact__title">Get in touch.</h2>
          {subLines.map((line, i) => (
            <p className="contact__sub" key={i}><InlineLine text={line} /></p>
          ))}
          <a href={`mailto:${addr}`} className="contact__email">{addr}</a>

          {cvPath && (
            <p className="contact__cv">
              <a href={cvPath} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                Download CV (PDF) ↓
              </a>
            </p>
          )}

          {links.length > 0 && (
            <ul className="contact__socials" aria-label="Profiles elsewhere">
              {links.map((s) => {
                const icon = iconFor(s);
                return (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer me" title={s.handle || s.name}>
                      {icon && (
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                          <path d={icon} />
                        </svg>
                      )}
                      <span>{s.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
