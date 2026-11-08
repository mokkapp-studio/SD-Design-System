import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'urgent' | 'warning' | 'ok' | 'info' | 'primary' | 'muted';
  size?: 'sm' | 'md';
}

export default function Badge({ variant = 'info', size = 'sm', className = '', children, ...props }: BadgeProps) {
  const variants = {
    urgent: 'bg-red-50 text-red-600 border border-red-200',
    warning: 'bg-warning-subtle text-warning-text border border-warning-subtle',
    ok: 'bg-green-50 text-green-700 border border-green-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    primary: 'bg-orange-50 text-[#E8622A] border border-orange-200',
    muted: 'bg-gray-100 text-gray-500 border border-gray-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
