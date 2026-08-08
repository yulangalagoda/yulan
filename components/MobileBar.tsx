interface Props {
  email?: string;
  cvPath?: string | null;
}

/**
 * Phone-only action bar, pinned to the bottom once the hero has scrolled past.
 * The page is aimed at hiring managers first, and on a phone the contact
 * section is nine screens down; the two things someone actually wants to do
 * should never require a scroll.
 */
export default function MobileBar({ email = 'hi@yulan.me', cvPath }: Props) {
  return (
    <div className="rg-bar" data-rg-bar aria-label="Quick actions">
      <a className="rg-bar__btn rg-bar__btn--p" href={`mailto:${email}`}>
        Email me
      </a>
      {cvPath ? (
        <a className="rg-bar__btn" href={cvPath} target="_blank" rel="noopener noreferrer">
          Download CV
        </a>
      ) : (
        <a className="rg-bar__btn" href="#work">View work</a>
      )}
    </div>
  );
}
