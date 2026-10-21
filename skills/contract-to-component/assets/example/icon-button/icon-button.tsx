/** @contract IconButton@0.1.0 */
import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import styles from './icon-button.module.css';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'disabled' | 'children' | 'aria-label'> {
  variant?: 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost';
  color?: 'accent' | 'neutral' | 'error';
  size?: '1' | '2' | '3' | '4';
  highContrast?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  'aria-label': string;
  type?: 'button' | 'submit' | 'reset';
  onPress?: (event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  variant = 'solid',
  color = 'accent',
  size = '2',
  highContrast = false,
  loading = false,
  disabled = false,
  icon,
  'aria-label': ariaLabel,
  type = 'button',
  onPress,
  ref,
  ...rest
}: IconButtonProps) {
  const blocked = disabled || loading; // en Figma loading solo existe con state=disable (ver meta.needsReview)
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={styles.root}
      data-part="root"
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-high-contrast={highContrast || undefined}
      data-loading={loading || undefined}
      disabled={blocked}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={blocked ? undefined : onPress}
    >
      {loading ? (
        // TODO(contract): el spinner no tiene contrato propio; este es un marcador sencillo
        <span data-part="spinner" className={styles.spinner} aria-hidden="true" />
      ) : (
        <span data-part="icon" className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
