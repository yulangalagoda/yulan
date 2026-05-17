// Logo: YG monogram in Cormorant Garamond italic.
// Cormorant Garamond is already loaded on the page via Google Fonts so it
// renders correctly in this inline SVG. Size is controlled by parent CSS
// (28px in header, 24px in footer).

interface Props {
  alt?: string;
}

export default function Logo({ alt = 'YG' }: Props) {
  return (
    <svg viewBox="0 0 36 28" aria-label={alt} fill="currentColor" overflow="visible">
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle="italic"
        fontWeight="400"
        fontSize="24"
        letterSpacing="-0.5"
      >YG</text>
    </svg>
  );
}
