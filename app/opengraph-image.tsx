import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export const alt = 'Yulan Galagoda — Cyber Security Engineer & AI Researcher';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0C0F',
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
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#3DDC97',
            }}
          />
          <div
            style={{
              fontSize: 22,
              color: '#3DDC97',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            yulan.me — available for roles · research · consulting
          </div>
        </div>

        {/* Name + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: '#E8ECF1',
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            Yulan Galagoda
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: '#8A93A0',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            Cyber Security Engineer &amp; AI Researcher
          </div>
        </div>

        {/* trace + footer row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <svg width="1040" height="80" viewBox="0 0 1040 80">
            <path
              d="M0 40 L120 40 L140 12 L160 68 L180 40 L360 40 L380 22 L400 58 L420 40 L600 40 L620 6 L635 74 L655 40 L800 40 L815 30 L830 50 L845 40 L1040 40"
              fill="none"
              stroke="#3DDC97"
              strokeWidth="3"
            />
            <circle cx="620" cy="6" r="7" fill="#E0B050" />
          </svg>
          <div
            style={{
              fontSize: 22,
              color: '#4A525E',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Security Operations · Intrusion Detection · Adversarial ML · Plymouth, UK
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
