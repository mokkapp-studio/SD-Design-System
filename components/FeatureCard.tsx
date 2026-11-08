'use client';

import styles from './FeatureCard.module.css';

type Variant = 'default' | 'accent';

export interface FeatureCardProps {
  icon?:        React.ReactNode;
  title:        string;
  description:  string;
  variant?:     Variant;
  className?:   string;
}

export function FeatureCard({ icon, title, description, variant = 'default', className }: FeatureCardProps) {
  const cls = [styles.root, styles[variant], className].filter(Boolean).join(' ');
  return (
    <div data-part="root" className={cls}>
      {icon && (
        <div data-part="icon" className={styles.icon}>
          {icon}
        </div>
      )}
      <h3 data-part="title" className={styles.title}>{title}</h3>
      <p data-part="description" className={styles.description}>{description}</p>
    </div>
  );
}
