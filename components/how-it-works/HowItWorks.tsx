import type { ReactNode } from 'react';

export interface HowItWorksStep {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface HowItWorksProps {
  heading?: string;
  subheading?: string;
  steps: HowItWorksStep[];
  variant?: 'numbered' | 'cards' | 'timeline';
  theme?: 'light' | 'dark';
  accentColor?: string;
  showConnectors?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  columns?: 2 | 3 | 4;
}

const THEMES = {
  light: {
    bg: '#ffffff',
    text: '#111111',
    muted: '#6b7280',
    border: '#e5e7eb',
    numberText: '#ffffff',
  },
  dark: {
    bg: '#0d0d0d',
    text: '#f9fafb',
    muted: '#9ca3af',
    border: '#1f2937',
    numberText: '#ffffff',
  },
} as const;

export function HowItWorks({
  heading = 'How it works',
  subheading,
  steps,
  variant = 'numbered',
  theme = 'light',
  accentColor = '#111111',
  showConnectors = true,
  ctaLabel,
  ctaHref = '#',
  columns,
}: HowItWorksProps) {
  const t = THEMES[theme];
  const colCount = Math.min(columns ?? steps.length, 4);
  const Tag = variant === 'numbered' ? 'ol' : 'div';

  return (
    <section style={{ background: t.bg, color: t.text, width: '100%' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            color: t.text,
          }}>
            {heading}
          </h2>
          {subheading && (
            <p style={{
              margin: 0,
              fontSize: '1rem',
              color: t.muted,
              lineHeight: 1.6,
              maxWidth: 540,
              marginInline: 'auto',
            }}>
              {subheading}
            </p>
          )}
        </div>

        {/* Steps grid */}
        <Tag
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            gap: 32,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            position: 'relative',
          }}
        >
          {steps.slice(0, 5).map((step, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                position: 'relative',
              }}
            >
              {/* Connector line between steps */}
              {showConnectors && i < steps.length - 1 && variant === 'numbered' && (
                <div style={{
                  position: 'absolute',
                  top: 20,
                  left: 'calc(50% + 20px)',
                  right: 'calc(-50% + 20px)',
                  height: 1,
                  background: t.border,
                  zIndex: 0,
                }} />
              )}

              {/* Step number / icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: accentColor,
                  color: t.numberText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {step.icon ?? (i + 1)}
                </div>
              </div>

              {/* Step content */}
              <h3 style={{
                margin: 0,
                fontSize: '1.0625rem',
                fontWeight: 600,
                color: t.text,
                lineHeight: 1.3,
              }}>
                {step.title}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: t.muted,
                lineHeight: 1.6,
              }}>
                {step.description}
              </p>
            </li>
          ))}
        </Tag>

        {/* CTA */}
        {ctaLabel && (
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a
              href={ctaHref}
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: accentColor,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                borderRadius: 100,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              {ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
