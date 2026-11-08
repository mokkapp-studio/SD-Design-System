import { ReactNode } from 'react';

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'accent';
}

export default function FeatureCard({ icon, title, description, variant = 'default' }: FeatureCardProps) {
  const iconBg = variant === 'accent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary';

  return (
    <div className={`rounded-xl border p-6 flex flex-col gap-3 ${variant === 'accent' ? 'border-primary' : 'border-border'} bg-card`}>
      {icon && (
        <div className={`w-12 h-12 rounded-md flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
