/** @contract Button@2.0.2 */
import type { MouseEvent, ReactNode, Ref } from 'react';
import styles from './button.module.css';

export interface ButtonProps {
  variant?: 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost';
  color?: 'accent' | 'neutral' | 'error';
  size?: '1' | '2' | '3' | '4';
  highContrast?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Slot: solo `Icon` (composition: allowedComponents). */
  icon?: ReactNode;
  iconEnd?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'solid',
  color = 'accent',
  size = '2',
  highContrast = false,
  loading = false,
  disabled = false,
  icon,
  iconEnd,
  type = 'button',
  children,
  onPress,
  ref,
}: ButtonProps) {
  // events.onPress.blockedWhen: disabled y loading. loading NO usa el atributo disabled:
  // su aspecto es el de la variante, no el de disabled (behavior.loading.visual).
  const blocked = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      className={styles.root}
      data-part="root"
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-high-contrast={highContrast || undefined}
      data-loading={loading || undefined}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={blocked ? undefined : onPress}
    >
      {icon ? (
        <span data-part="icon" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      <span data-part="label" className={styles.label}>
        {children}
      </span>
      {iconEnd ? (
        <span data-part="iconEnd" className={styles.icon}>
          {iconEnd}
        </span>
      ) : null}
      {loading ? (
        // TODO(contract): la geometría del spinner de 8 hojas no está en tokens (meta.needsReview); marcador de 8 trazos.
        <svg data-part="spinner" className={styles.spinner} viewBox="0 0 16 16" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1="8" y1="1.5" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${i * 45} 8 8)`} />
          ))}
        </svg>
      ) : null}
    </button>
  );
}
