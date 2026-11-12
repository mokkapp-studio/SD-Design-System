/** @contract Icon@0.2.1 */
import type { Ref } from 'react';
import type { PhosphorIcon } from './icons';
import styles from './icon.module.css';

export interface IconProps {
  icon: PhosphorIcon;
  weight?: 'regular' | 'fill';
  size?: '14' | '16' | '18' | '20';
  label?: string;
  ref?: Ref<SVGSVGElement>;
}

export function Icon({ icon: Glyph, weight = 'regular', size = '16', label, ref }: IconProps) {
  return (
    <Glyph
      ref={ref}
      className={styles.root}
      data-part="root"
      data-size={size}
      weight={weight}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
