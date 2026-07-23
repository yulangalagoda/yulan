import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'Yulan Galagoda · Cyber Security Engineer & AI Researcher';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FBFAF7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: '#0E7C5A' }} />
          <div
            style={{
              fontSize: 22,
              color: '#0E7C5A',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            yulan.me · available for roles · research · consulting
          </div>
        </div>

        {/* Name + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: '#15171C',
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            Yulan Galagoda
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: '#0E7C5A',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            Cyber Security Engineer &amp; AI Researcher
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            fontSize: 22,
            color: '#767B85',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Security Operations · Intrusion Detection · Adversarial ML · United Kingdom
        </div>
      </div>
    ),
    { ...size },
  );
}
