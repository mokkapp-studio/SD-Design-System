'use client';

import styles from './PricingCard.module.css';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface PricingCardProps {
  tier:          string;
  price:         string;
  period?:       string;
  description?:  string;
  features?:     string[];
  cta:           React.ReactNode;
  highlighted?:  boolean;
  badge?:        string;
  className?:    string;
}

export function PricingCard({
  tier,
  price,
  period,
  description,
  features = [],
  cta,
  highlighted = false,
  badge,
  className,
}: PricingCardProps) {
  const cls = [
    styles.root,
    highlighted && styles.highlighted,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div data-part="root" className={cls}>
      {badge && <span data-part="badge" className={styles.badge}>{badge}</span>}

      <div data-part="header" className={styles.header}>
        <span data-part="tier" className={styles.tier}>{tier}</span>
        <div data-part="pricing" className={styles.pricing}>
          <span data-part="price" className={styles.price}>{price}</span>
          {period && <span data-part="period" className={styles.period}>/{period}</span>}
        </div>
        {description && <p data-part="description" className={styles.description}>{description}</p>}
      </div>

      {features.length > 0 && (
        <ul data-part="features" className={styles.features}>
          {features.map((f, i) => (
            <li key={i} data-part="feature" className={styles.feature}>
              <span className={styles.check}><CheckIcon /></span>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div data-part="cta" className={styles.cta}>{cta}</div>
    </div>
  );
}
