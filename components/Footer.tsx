'use client';

import styles from './Footer.module.css';

export interface FooterLink   { label: string; href: string; }
export interface FooterColumn { heading: string; links: FooterLink[]; }

export interface FooterProps {
  logo:         React.ReactNode;
  columns?:     FooterColumn[];
  bottomText?:  string;
  socials?:     React.ReactNode;
  className?:   string;
}

export function Footer({ logo, columns = [], bottomText, socials, className }: FooterProps) {
  return (
    <footer data-part="root" className={[styles.root, className].filter(Boolean).join(' ')}>
      <div data-part="inner" className={styles.inner}>
        <div data-part="brand" className={styles.brand}>
          {logo}
          {socials && <div data-part="socials" className={styles.socials}>{socials}</div>}
        </div>

        {columns.length > 0 && (
          <nav data-part="columns" className={styles.columns} aria-label="Footer navigation">
            {columns.map((col) => (
              <div key={col.heading} data-part="column" className={styles.column}>
                <span data-part="heading" className={styles.heading}>{col.heading}</span>
                <ul data-part="links" className={styles.links}>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={styles.link}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>

      {bottomText && (
        <div data-part="bottom" className={styles.bottom}>
          <p className={styles.bottomText}>{bottomText}</p>
        </div>
      )}
    </footer>
  );
}
