/** @contract Switch@0.1.0 */
import { useId } from 'react';
import type { Ref } from 'react';
import styles from './switch.module.css';

export interface SwitchProps {
  variant?: 'classic' | 'surface' | 'soft';
  size?: '1' | '2' | '3';
  highContrast?: boolean;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  ref?: Ref<HTMLButtonElement>;
}

export function Switch({
  variant = 'surface',
  size = '2',
  highContrast = false,
  checked = false,
  disabled = false,
  label,
  name,
  onCheckedChange,
  ref,
}: SwitchProps) {
  const id = useId();
  return (
    <span
      className={styles.root}
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-high-contrast={highContrast || undefined}
    >
      {/* TODO(contract): a11y.name pide aria-label sin etiqueta visible, pero aria-label no está en props; sin label el botón queda sin nombre. */}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={styles.track}
        data-part="track"
        onClick={() => onCheckedChange?.(!checked)}
      >
        <span className={styles.thumb} data-part="thumb" />
      </button>
      {label ? (
        <label htmlFor={id} className={styles.label} data-part="label">
          {label}
        </label>
      ) : null}
      {/* TODO(contract): el valor enviado no está definido; se usa 'on' / 'off'. */}
      {name ? <input type="hidden" name={name} value={checked ? 'on' : 'off'} disabled={disabled} /> : null}
    </span>
  );
}
