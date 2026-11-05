import type { ReactNode } from 'react';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumnDef {
  title: string;
  links: FooterLink[];
}

export interface FooterSocial {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface FooterBrand {
  name: string;
  tagline?: string;
  logo?: ReactNode;
}

export interface FooterColumnProps {
  brand: FooterBrand;
  columns: FooterColumnDef[];
  socials?: FooterSocial[];
  copyright: string;
  bottomLinks?: FooterLink[];
  theme?: 'light' | 'dark';
}

const THEMES = {
  light: {
    bg: '#ffffff',
    text: '#111111',
    muted: '#6b7280',
    border: '#e5e7eb',
    linkColor: '#374151',
  },
  dark: {
    bg: '#0d0d0d',
    text: '#f9fafb',
    muted: '#9ca3af',
    border: '#1f2937',
    linkColor: '#d1d5db',
  },
} as const;

export function FooterColumn({
  brand,
  columns,
  socials = [],
  copyright,
  bottomLinks = [],
  theme = 'light',
}: FooterColumnProps) {
  const t = THEMES[theme];
  const colCount = Math.min(columns.length, 4);

  return (
    <footer
      style={{
        background: t.bg,
        color: t.text,
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '72px 24px 0',
        }}
      >
        {/* Column grid: brand + link columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `1.4fr ${Array(colCount).fill('1fr').join(' ')}`,
            gap: '48px 40px',
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Logo or name */}
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: t.text, lineHeight: 1 }}>
              {brand.logo ?? brand.name}
            </div>

            {/* Tagline */}
            {brand.tagline && (
              <p style={{ margin: 0, fontSize: '0.875rem', color: t.muted, lineHeight: 1.6, maxWidth: 240 }}>
                {brand.tagline}
              </p>
            )}

            {/* Social icons */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: t.muted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: `1px solid ${t.border}`,
                      transition: 'color 0.15s ease, border-color 0.15s ease',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = t.text;
                      (e.currentTarget as HTMLElement).style.borderColor = t.text;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = t.muted;
                      (e.currentTarget as HTMLElement).style.borderColor = t.border;
                    }}
                  >
                    <span aria-hidden style={{ display: 'flex', width: 16, height: 16 }}>
                      {s.icon}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.slice(0, 4).map(col => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{
                margin: 0,
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: t.muted,
              }}>
                {col.title}
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      style={{
                        fontSize: '0.875rem',
                        color: t.linkColor,
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = t.text; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = t.linkColor; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: `1px solid ${t.border}`, margin: '48px 0 0' }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '20px 0 24px',
        }}>
          <span style={{ fontSize: '0.8125rem', color: t.muted }}>
            {copyright}
          </span>
          {bottomLinks.length > 0 && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {bottomLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.8125rem',
                    color: t.muted,
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = t.text; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = t.muted; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
