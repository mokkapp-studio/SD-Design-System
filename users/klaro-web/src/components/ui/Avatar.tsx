interface AvatarProps {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

export default function Avatar({ src, fallback, size = 'md', alt = '' }: AvatarProps) {
  const cls = `${sizes[size]} rounded-full overflow-hidden inline-flex items-center justify-center bg-muted text-muted-foreground font-medium shrink-0`;

  if (src) {
    return (
      <span className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </span>
    );
  }

  return <span className={cls}>{fallback ?? '?'}</span>;
}
