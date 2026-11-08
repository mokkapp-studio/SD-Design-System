import { ReactNode } from 'react';

interface HeroProps {
  badge?: ReactNode;
  headline: string;
  subtext?: string;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  media?: ReactNode;
  variant?: 'centered' | 'split';
}

export default function Hero({
  badge,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
  media,
  variant = 'centered',
}: HeroProps) {
  if (variant === 'split') {
    return (
      <section className="w-full bg-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            {badge && <div>{badge}</div>}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">{headline}</h1>
            {subtext && <p className="text-lg text-muted-foreground">{subtext}</p>}
            {(primaryCta || secondaryCta) && (
              <div className="flex flex-wrap gap-3">
                {primaryCta}
                {secondaryCta}
              </div>
            )}
          </div>
          {media && <div className="flex-1 w-full">{media}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-6">
        {badge && <div>{badge}</div>}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl">{headline}</h1>
        {subtext && <p className="text-lg text-muted-foreground max-w-xl">{subtext}</p>}
        {(primaryCta || secondaryCta) && (
          <div className="flex flex-wrap justify-center gap-3">
            {primaryCta}
            {secondaryCta}
          </div>
        )}
      </div>
    </section>
  );
}
