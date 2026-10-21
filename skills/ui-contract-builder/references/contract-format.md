# Formato del contrato

Fuente de verdad del formato: `assets/component.schema.json`. Plantilla: `assets/_template.contract.json`. Ejemplos reales: `assets/example.*`.

Principio: el contrato guarda **lo que ni Figma ni el código pueden decir solos** (intención, límites, reglas). Lo que se puede leer de la fuente (`props.type`, `default`, medidas) se anota en `meta.derivableFromSource`.

## Bloques

**Núcleo (siempre):** `id`, `name`, `version`, `status`, `description`, `guidance`, `semantics`, `props`, `states`, `anatomy`, `tokens`, `a11y`.

**Opcionales (los que apliquen):** `category`, `composition`, `layout`, `events`, `form`, `overlay`, `data`, `media`, `theming`, `i18n`, `content`, `behavior`, `testing`, `governance`, `anchors`, `meta`. Añade bloques propios dentro de los objetos libres (`composition`, `layout`, `behavior`, `meta`) sin tocar el esquema.

| Tipo de componente | Añade además |
| --- | --- |
| Acción (Button, IconButton) | `events`, `layout`, `behavior` (loading), `content` |
| Enlace / navegación (Link, Tabs, Breadcrumb) | `composition`, `a11y.keyboard`, `behavior` |
| Contenedor (Panel, Modal) | `composition` + slots, `layout` |
| Campo (Input, Checkbox, Select) | `form`, `events` |
| Capa (Dialog, Popover, Menu) | `overlay`, `events` |
| Datos (Table, List) | `data` |
| Media (Avatar, Image) | `media` |

## Qué va en cada bloque

- **id / name / version / status**: `id` en kebab-case, `name` en PascalCase (el archivo es `<name>.contract.json`). Versión semver (`1.2.3`); `status`: `draft` | `beta` | `stable` | `deprecated`; `category`: `action` | `input` | `container` | `overlay` | `data` | `media` | `navigation` | `feedback`.
- **description**: 1–2 frases, intención de uso. Decisión de producto, no sale de Figma.
- **guidance**: `dos` (2–5 frases), `donts` (`case`, `useInstead`, `why`; mínimo 2), `related` (`component`, `relation`: `alternative` | `similar` | `contains` | `contained-by`, `difference`).
- **semantics**: `element` (HTML), `role`, `refTarget` (clave de `anatomy` que recibe el `ref`), `elementByProp`.
- **props**: `name`, `type` (TypeScript), `default` o `required`, `description`, `usage` (opcional), `bindings.figma` (`property`, `type`, `value`) o `null` si es solo de código.
- **states**: `native` (se resuelven con CSS: hover, focus-visible, active) y `controlled` (son props: `disabled`, `loading`, con su atributo `aria`).
- **anatomy**: objeto de partes. Cada parte: `element`, `description`, `optional`, `figmaLayer`, `figmaToggle`, y `slot` (`key`, `allowedComponents`, `minItems`, `maxItems`, `mandatory`, `figmaProp`) o `content` (`prop`).
- **tokens**: `policy` (`allowed`, `forbidden`), `scales` (opcional) y `bindings`.
- **a11y**: `role`, `name`, `keyboard[]`, `focusIndicator`, `minTarget`, `contrastNote`, `wcag[]`.
- **anchors**: `figma.file`, `figma.node` (con `:`), `code.importPath`, `code.export`.
- **meta**: `source`, `derivableFromSource[]`, `needsReview[]`.

## Enlace Figma ↔ código (`bindings.figma`)

- `property` idéntico al de Figma (mayúsculas, emojis y errores incluidos; omite el sufijo `#id` de las propiedades no variante).
- `type`: `VARIANT` | `BOOLEAN` | `TEXT` | `INSTANCE_SWAP` | `SLOT`.
- **Booleano en código, valor de variante en Figma**: usa `value` con el valor de Figma que equivale a `true` (`disabled` ↔ `state=disable`, `loading` ↔ `loading=true`). Varias props pueden compartir un eje si su `value` es distinto.
- Partes que se muestran/ocultan con un boolean que no es prop en código (foco, backdrop): `anatomy.<parte>.figmaToggle`.
- Valores por defecto de Figma con ✦ (`solid ✦`): en el contrato va el valor sin marca. Si el default de Figma no coincide con la intención, pon la intención y anótalo en `needsReview`.

## Tokens

- Nombre de token = ruta de Figma en minúsculas, espacios → `-`, `%` fuera, separada por puntos: `Colors/Accent/Accent Alpha/11` → `colors.accent.accent-alpha.11`. Variable CSS: `--colors-accent-accent-alpha-11`.
- `tokens.policy.allowed` lista **categorías** (primer tramo de la ruta: `colors`, `spacing`, `radius`, `text-style`, `shadows`…). Una categoría que el check no encuentre en `allowed` es error.
- Placeholders: `{size}` se expande con los valores del enum de esa prop; `{color.step}` toma `tokens.scales.<valor de color>.step`. `null` en `scales` = no existe para ese valor.
- Estructura de `bindings`: `base` (no cambia), `bySize`, `byVariant.<variante>.<estado>`, `byHighContrast` (solo lo que cambia), `byState.disabled`.
- Valores numéricos sueltos (grosor de borde, opacity, anchos) se admiten como números, no como cadenas. **Disabled nunca con opacity**; usa tokens neutros.
- Si Figma tiene un valor sin variable (opacity de hover, degradados), no lo inventes: `needsReview`.

## Convenciones de calidad

- `donts`: cada uno con alternativa real (`useInstead`) y razón. Si el destino no tiene contrato, genera aviso en el check: está bien.
- `a11y.name` dice de dónde sale el nombre accesible. Componentes solo con icono: `aria-label` obligatorio y prop propia.
- Touch target: apunta si hay objetivos < 24 px (WCAG 2.5.8), con la excepción de enlaces en línea.
- Vocabulario de props: respeta `docs/components.md` del proyecto (`variant`, `size`, `color`, `highContrast`, `disabled`, `loading`). Nunca dos nombres para lo mismo.
- Versionado: patch = texto; minor = prop o estado nuevo; major = renombrar o quitar. El cambio de contrato va antes que el de código.
