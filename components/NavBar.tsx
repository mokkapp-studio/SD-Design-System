'use client';

import { useEffect, useRef } from 'react';
import styles from './NavBar.module.css';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavBarProps {
  variant?: 'surface' | 'transparent';
  logo: React.ReactNode;
  items?: NavItem[];
  cta?: React.ReactNode;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function NavBar({
  variant = 'surface',
  logo,
  items = [],
  cta,
  menuOpen = false,
  onMenuOpenChange,
}: NavBarProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onMenuOpenChange?.(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen, onMenuOpenChange]);

  return (
    <header
      data-part="root"
      className={[styles.root, styles[variant]].join(' ')}
    >
      <div data-part="inner" className={styles.inner}>
        {/* Logo */}
        <div data-part="logo" className={styles.logo}>
          {logo}
        </div>

        {/* Desktop nav */}
        <nav data-part="nav" aria-label="Site navigation">
          <ul data-part="items" className={styles.nav}>
            {items.map((item) => (
              <li key={item.href} className={styles.navItem}>
                <a
                  href={item.href}
                  className={[
                    styles.navLink,
                    item.active ? styles.navLinkActive : '',
                  ].filter(Boolean).join(' ')}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA */}
        {cta && (
          <div data-part="cta" className={styles.cta}>
            {cta}
          </div>
        )}

        {/* Mobile trigger */}
        <button
          ref={triggerRef}
          data-part="menu-trigger"
          className={styles.menuTrigger}
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-drawer"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => onMenuOpenChange?.(!menuOpen)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="navbar-mobile-drawer"
        data-part="mobile-drawer"
        className={[
          styles.mobileDrawer,
          menuOpen ? styles.mobileDrawerOpen : '',
        ].filter(Boolean).join(' ')}
        aria-hidden={!menuOpen}
      >
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={[
              styles.mobileNavLink,
              item.active ? styles.mobileNavLinkActive : '',
            ].filter(Boolean).join(' ')}
            aria-current={item.active ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}

        {cta && (
          <div className={styles.mobileCta}>
            {cta}
          </div>
        )}
      </div>
    </header>
  );
}
