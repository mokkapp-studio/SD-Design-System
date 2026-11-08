'use client';

import { forwardRef } from 'react';
import styles from './Button.module.css';

type Variant = 'solid' | 'outline' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  fullWidth?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?:   React.ReactNode;
}

const Spinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle
      cx="8" cy="8" r="6"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeDasharray="28" strokeDashoffset="10"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    variant   = 'solid',
    size      = 'md',
    disabled  = false,
    loading   = false,
    fullWidth = false,
    iconStart,
    iconEnd,
    children,
    className,
    onClick,
    ...props
  },
  ref
) => {
  const isDisabled = disabled || loading;

  const cls = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth  ? styles.fullWidth : null,
    loading    ? styles.loading   : null,
    className  ?? null,
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      data-part="root"
      className={cls}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {loading ? (
        <span data-part="spinner" className={styles.spinner}>
          <Spinner />
        </span>
      ) : (
        <>
          {iconStart && (
            <span data-part="icon-start" className={styles.icon}>
              {iconStart}
            </span>
          )}
          <span data-part="label">{children}</span>
          {iconEnd && (
            <span data-part="icon-end" className={styles.icon}>
              {iconEnd}
            </span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
