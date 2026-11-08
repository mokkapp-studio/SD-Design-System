'use client';

import styles from './Avatar.module.css';

type Size = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?:       string;
  alt?:       string;
  fallback?:  string;
  size?:      Size;
  className?: string;
}

export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
  const cls = [styles.avatar, styles[size], className].filter(Boolean).join(' ');
  return (
    <span data-part="root" className={cls} role={!src ? 'img' : undefined} aria-label={!src ? alt : undefined}>
      {src ? (
        <img data-part="image" src={src} alt={alt} className={styles.image} />
      ) : (
        <span data-part="fallback" className={styles.fallback} aria-hidden="true">
          {fallback}
        </span>
      )}
    </span>
  );
}
