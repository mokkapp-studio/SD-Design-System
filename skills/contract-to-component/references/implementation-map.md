# Del contrato al código

Una fila por bloque. El ejemplo completo es `assets/example/icon-button/`.

| Bloque del contrato | En el código |
| --- | --- |
| `name`, `id`, `version` | `export function <name>`, carpeta `<id>/`, comentario `/** @contract <name>@<version> */` |
| `props[]` | `export interface <name>Props`: mismo nombre, tipo, `?` si tiene `default`, sin `?` si `required`. Defaults en la desestructuración |
| `props[].type` con `'a' \| 'b'` | Unión de literales, idéntica |
| `props[].name` con guion (`aria-label`) | Clave entre comillas en el tipo y alias al desestructurar: `'aria-label': ariaLabel` |
| `props[]` tipo `ReactNode` con `slot` | Prop de tipo `ReactNode` o `children`, según `anatomy.<parte>.slot` |
| `semantics.element` | Elemento HTML de la parte raíz (`button`, `a`, `div`…) |
| `semantics.refTarget` | `ref` en esa parte. React 19: prop `ref` normal (`ref?: Ref<HTMLButtonElement>`). React 18: `forwardRef` |
| `anatomy.<parte>` | `data-part="<clave>"` en el elemento. `element: "css"` no tiene elemento (foco, subrayado) |
| `anatomy.<parte>.content.prop` | Se pinta con esa prop (`children`) |
| `states.native` | CSS: `:hover`, `:focus-visible`, `:active` (con `:not(:disabled)` en hover/active) |
| `states.controlled[]` | Props. Lo que diga `aria`: `aria-busy`, `aria-disabled`, atributo `disabled` nativo… |
| Props de variante (`variant`, `color`, `size`…) | `data-variant`, `data-color`, `data-size` en el elemento raíz |
| Props booleanas que cambian estilo (`highContrast`, `loading`) | `data-high-contrast={highContrast \|\| undefined}` (atributo presente o ausente, nunca `="false"`) |
| `tokens.bindings`, `tokens.scales` | Bloque generado por `gen-css.mjs`. Las plantillas `{color.step}` se expanden por valor |
| `layout.height/width` | Si hay token (`tokens.space.button-height-N`), ya lo da el bloque generado. Si no, valor del contrato en CSS |
| `layout.iconSize`, `layout.autoLayout` | CSS escrito a mano con los valores del contrato |
| `events[]` | Props `onPress`, etc. No se disparan si `blockedWhen` incluye un estado activo |
| `behavior.loading` | `loading` → `aria-busy`, spinner en lugar del contenido, no emite eventos, mismo tamaño |
| `behavior.motion[]` | `transition` solo en la propiedad indicada; `@media (prefers-reduced-motion: reduce)` → instantáneo |
| `behavior.responsive[]` | `@media` con el breakpoint indicado. Si es un valor suelto, es un `needsReview` |
| `composition.forbiddenChildren` | Comentario/tipo; el contrato manda: no los renderices dentro |
| `composition.nestedComponents` | Importa el componente existente y úsalo con sus `fixedProps` |
| `a11y` | Nombre accesible, teclado, foco visible, área mínima. `aria-label` obligatorio si el contrato lo exige (prop requerida) |
| `meta.needsReview` | Lo que afecte: pregunta, o `TODO(contract): …` y a la lista del resumen |

## Qué hace `gen-css.mjs` y qué no

**Traduce** estas claves de `tokens.bindings`: `background`, `text`, `iconColor`, `border`, `borderWidth`, `shadow`, `opacity`, `height`, `size`, `paddingX`, `gap`, `radius`, `textStyle`, y el `underline` del Link. Organizado por `base`, `bySize`, `byVariant.<v>.<default|hover|active>`, `byHighContrast`, `byState.disabled`.

**Reglas del CSS que produce:**
- Los atributos van dentro de `:where(...)`, de modo que todas las reglas de estado tienen la misma especificidad y manda el orden (base → tamaño → variante → alto contraste → disabled).
- `hover` y `active` llevan `:not(:disabled)`; `disabled` va con `:disabled`.
- Un valor `null` de una escala (`surface` en neutral) se traduce a «sin»: `transparent` en fondo y borde, `none` en sombra.
- `borderWidth` numérico → `Npx` y `border-style: solid`.
- No genera el anillo de foco (`focusRing*`): se escribe a mano desde `base.focusRingInner/Outer`.

**No traduce** (sale en el aviso «claves sin traducir», las escribes tú desde el contrato): contratos de campos con estados propios, como `placeholder`, `filled`, `readOnly`, `checked`, `indeterminate`, `track`, `thumb`, `labelColor`, `iconContainerPadding`, `inputTextStyle`. TextField, Checkbox, RadioGroup y Switch caen aquí. El verificador sí los comprueba (qué variables usas, que existan, que no haya valores sueltos).

Al escribir esas partes a mano: usa las claves del contrato como guía de **qué token va en qué propiedad** y mira `byState` / `byVariant` para saber en qué estado. Si el contrato no dice la propiedad CSS, no la adivines: `TODO(contract)`.

## Patrones

**Elemento raíz con atributos**

```tsx
<button
  ref={ref}
  className={styles.root}
  data-part="root"
  data-variant={variant}
  data-color={color}
  data-size={size}
  data-high-contrast={highContrast || undefined}
  disabled={disabled}
  aria-busy={loading || undefined}
>
```

**Slot opcional** (`min: 0`): renderiza la parte solo si hay contenido, con su `data-part`.

**Radix (comportamiento complejo)**

```tsx
"use client";
import { Checkbox as RadixCheckbox } from 'radix-ui';
// El indicador y el estado vienen de Radix (data-state="checked|unchecked|indeterminate").
// Estilos: selectores sobre [data-state="…"] y nuestros data-* de variante.
```

El contrato dice las props y los tokens; Radix pone el foco, el teclado y el ARIA. Si Radix pone `data-state`, úsalo en el CSS en lugar de inventar otro atributo, y verifica que el contrato no pida otro.

**Iconos:** solo los del registry, desde el `icons.ts` generado del proyecto, a través del componente `Icon`. El tamaño lo fija el CSS del padre según `layout.iconSize`.

**Documentación:** si el proyecto genera `<id>.md` desde el contrato, hazlo con: descripción, do's y don'ts, tabla de props, estados, anatomía, tokens y accesibilidad, **sin añadir nada que no esté en el contrato**.
