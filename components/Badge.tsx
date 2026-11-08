'use client';

import styles from './Badge.module.css';

type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'destructive';
type Size    = 'sm' | 'md';

export interface BadgeProps {
  variant?:   Variant;
  size?:      Size;
  children:   React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  const cls = [styles.badge, styles[variant], styles[size], className].filter(Boolean).join(' ');
  return (
    <span data-part="root" className={cls}>
      {children}
    </span>
  );
}
