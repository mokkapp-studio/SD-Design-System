'use client';

import styles from './Card.module.css';

type Variant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  variant?:   Variant;
  padding?:   boolean;
  children:   React.ReactNode;
  className?: string;
}

export function Card({ variant = 'default', padding = true, children, className }: CardProps) {
  const cls = [styles.card, styles[variant], padding && styles.padded, className].filter(Boolean).join(' ');
  return <div data-part="root" className={cls}>{children}</div>;
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-part="header" className={[styles.header, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-part="body" className={[styles.body, className].filter(Boolean).join(' ')}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div data-part="footer" className={[styles.footer, className].filter(Boolean).join(' ')}>{children}</div>;
}
