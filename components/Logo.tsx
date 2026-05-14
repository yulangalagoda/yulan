// Logo: renders the uploaded Notion logo if available, otherwise the YG monogram SVG.
// Size is controlled by parent CSS (28px in header, 24px in footer).

interface Props {
  src: string | null;
  alt?: string;
}

export default function Logo({ src, alt = 'YG' }: Props) {
  if (src) {
    return <img src={src} alt={alt} />;
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="5" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.8" fill="currentColor" />
    </svg>
  );
}
