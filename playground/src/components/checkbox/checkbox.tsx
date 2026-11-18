/** @contract Checkbox@0.1.0 */
import { useId } from 'react';
import type { KeyboardEvent, Ref } from 'react';
import styles from './checkbox.module.css';

export interface CheckboxProps {
  variant?: 'classic' | 'surface' | 'soft';
  size?: '1' | '2' | '3';
  highContrast?: boolean;
  checked?: boolean | 'indeterminate';
  disabled?: boolean;
  label?: string;
  name?: string;
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  /** refTarget = box (la casilla). */
  ref?: Ref<HTMLButtonElement>;
}

export function Checkbox({
  variant = 'surface',
  size = '2',
  highContrast = false,
  checked = false,
  disabled = false,
  label,
  name,
  onCheckedChange,
  ref,
}: CheckboxProps) {
  const id = useId();
  const state = checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';

  // testing: «indeterminate … al pulsar pasa a true»
  const toggle = () => onCheckedChange?.(checked === 'indeterminate' ? true : !checked);

  // a11y.keyboard: Space marca (lo hace el botón nativo al soltar); Enter no marca.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  return (
    <span
      className={styles.root}
      data-part="root"
      data-variant={variant}
      data-size={size}
      data-high-contrast={highContrast || undefined}
    >
      {/* TODO(contract): a11y.name pide aria-label sin etiqueta visible, pero aria-label no está en props; sin label la casilla no tiene nombre. */}
      <button
        ref={ref}
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
        disabled={disabled}
        className={styles.box}
        data-part="box"
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        {state === 'unchecked' ? null : (
          // TODO(contract): el indicador solo se midió en size 2 (check 9x8 dentro de 16x16, guion 5x1); el mismo dibujo escala a 1 y 3.
          <svg className={styles.indicator} data-part="indicator" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {state === 'checked' ? (
              <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        )}
      </button>
      {label ? (
        <label htmlFor={id} className={styles.label} data-part="label">
          {label}
        </label>
      ) : null}
      {/* TODO(contract): form.note dice «según name y checked» sin concretar el valor; se envía 'on' / 'off' / 'indeterminate'. */}
      {name ? <input type="hidden" name={name} value={checked === 'indeterminate' ? 'indeterminate' : checked ? 'on' : 'off'} disabled={disabled} /> : null}
    </span>
  );
}
