import Avatar from './Avatar';

interface TestimonialCardProps {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-primary' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialCard({ quote, authorName, authorRole, authorAvatar, rating = 5 }: TestimonialCardProps) {
  const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <figure className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      <Stars count={rating} />
      <blockquote className="text-base text-foreground leading-relaxed line-clamp-4">"{quote}"</blockquote>
      <figcaption className="flex items-center gap-3 mt-auto">
        <Avatar src={authorAvatar} fallback={initials} size="sm" alt={authorName} />
        <div>
          <div className="text-sm font-semibold text-foreground">{authorName}</div>
          {authorRole && <div className="text-xs text-muted-foreground">{authorRole}</div>}
        </div>
      </figcaption>
    </figure>
  );
}
