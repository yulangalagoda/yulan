import { ImageResponse } from 'next/og';

export const alt = 'Yulan Galagoda — Cyber Security Engineer & AI Researcher';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF8F4',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '0 0 0 0',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Top navy bar */}
        <div style={{ width: '100%', height: 8, background: '#1B2A4E', flexShrink: 0 }} />

        {/* Content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '64px 80px',
          }}
        >
          {/* YG monogram */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: '#1B2A4E',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            YG
          </div>

          {/* Name + title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                fontSize: 88,
                fontWeight: 700,
                color: '#0E1116',
                lineHeight: 0.95,
                letterSpacing: '-0.04em',
              }}
            >
              Yulan Galagoda
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 400,
                color: '#6B6E76',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              Cyber Security Engineer &amp; AI Researcher
            </div>
          </div>

          {/* Footer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 48, height: 2, background: '#1B2A4E', flexShrink: 0 }} />
            <div
              style={{
                fontSize: 22,
                color: '#1B2A4E',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Plymouth, UK · yulan.me
            </div>
          </div>
        </div>

        {/* Bottom navy bar */}
        <div style={{ width: '100%', height: 4, background: '#1B2A4E', flexShrink: 0 }} />
      </div>
    ),
    { ...size },
  );
}
