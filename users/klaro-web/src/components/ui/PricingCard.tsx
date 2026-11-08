import { ReactNode } from 'react';

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description?: string;
  features?: string[];
  cta: ReactNode;
  highlighted?: boolean;
  badge?: string;
}

function Check() {
  return (
    <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingCard({ tier, price, period, description, features = [], cta, highlighted = false, badge }: PricingCardProps) {
  const surface = highlighted
    ? 'bg-primary text-primary-foreground border-primary shadow-md'
    : 'bg-card text-foreground border-border';

  const muted = highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground';
  const checkColor = highlighted ? 'text-primary-foreground' : 'text-primary';

  return (
    <div className={`rounded-xl border p-6 flex flex-col gap-6 min-w-[260px] max-w-[380px] ${surface}`}>
      {badge && (
        <span className={`text-xs font-semibold uppercase tracking-wide ${highlighted ? 'text-primary-foreground/80' : 'text-primary'}`}>
          {badge}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <div className="text-sm font-semibold">{tier}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className={`text-sm ${muted}`}>/ {period}</span>}
        </div>
        {description && <p className={`text-sm ${muted}`}>{description}</p>}
      </div>
      {features.length > 0 && (
        <ul className="flex flex-col gap-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <svg className={`w-4 h-4 shrink-0 ${checkColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto w-full">{cta}</div>
    </div>
  );
}
