'use client';

import styles from './TestimonialCard.module.css';
import { Avatar } from './Avatar';

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.5l1.65 3.34 3.69.54-2.67 2.6.63 3.67L8 9.77l-3.3 1.74.63-3.67L2.66 5.38l3.69-.54z" />
  </svg>
);

export interface TestimonialCardProps {
  quote:          string;
  authorName:     string;
  authorRole?:    string;
  authorAvatar?:  string;
  rating?:        1 | 2 | 3 | 4 | 5;
  className?:     string;
}

export function TestimonialCard({
  quote,
  authorName,
  authorRole,
  authorAvatar,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <figure data-part="root" className={[styles.root, className].filter(Boolean).join(' ')}>
      {rating > 0 && (
        <div data-part="rating" className={styles.rating} aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: rating }, (_, i) => <StarIcon key={i} />)}
        </div>
      )}

      <blockquote data-part="quote" className={styles.quote}>
        {quote}
      </blockquote>

      <figcaption data-part="author" className={styles.author}>
        <Avatar
          src={authorAvatar}
          alt={authorName}
          fallback={authorName.slice(0, 2).toUpperCase()}
          size="sm"
        />
        <div data-part="meta" className={styles.meta}>
          <span data-part="name" className={styles.name}>{authorName}</span>
          {authorRole && <span data-part="role" className={styles.role}>{authorRole}</span>}
        </div>
      </figcaption>
    </figure>
  );
}
