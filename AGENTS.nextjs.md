# AGENTS.md — proyecto Next.js

Copia este archivo a la raíz del proyecto como `AGENTS.md`. Reglas para cualquier agente de IA que trabaje aquí.

## Este proyecto

- Next.js (App Router) + TypeScript estricto. Alias `@/` apunta a `src/`.
- Estilos: CSS Modules. Sin Tailwind, sin librerías de estilos, sin estilos en línea.
- El sistema de diseño vive en `design-system/` (submodule o copia). **No se edita desde aquí** salvo petición expresa.
- Fuente de verdad de cada componente: `design-system/contracts/<Componente>.contract.json`.
- Tokens: `design-system/tokens/tokens.css`, importado en `src/app/globals.css`.

## Estructura

```
src/
├── app/                              páginas (App Router)
│   ├── globals.css                   importa tokens.css
│   └── playground/page.tsx           muestra todos los componentes y variantes
└── components/
    └── <nombre-en-kebab>/
        ├── <nombre>.tsx              componente
        ├── <nombre>.module.css       estilos
        ├── <nombre>.contract.json    copia del contrato (no editar a mano)
        └── <nombre>.md               documentación generada desde el contrato
design-system/                        contratos, tokens, docs, check.mjs
```

## Antes de crear o modificar un componente

1. Lee `design-system/contracts/<Componente>.contract.json` completo. Si no existe, **para y pregunta**.
2. Lee `design-system/docs/components.md` (vocabulario de props).
3. Mira `meta.needsReview` del contrato: son huecos conocidos. No los rellenes con suposiciones: pregunta.
4. Mira qué componentes ya existen en `src/components/` y reutilízalos (los pide `composition.nestedComponents` o `slot.allowedComponents`).

## Reglas de código

- **Props:** nombres, tipos y valores por defecto exactamente como en `props`. No añadas ni quites props.
- **Props solo de código** (`bindings.figma: null`): impleméntalas igual.
- **Variantes:** `variant`, `color`, `size`, etc. se exponen como atributos `data-*` en el elemento (`data-variant="solid"`) y se estilan con selectores de atributo en el CSS Module. No generes clases dinámicas.
- **Partes:** cada clave de `anatomy` lleva `data-part="<clave>"`. El `ref` va en la parte de `semantics.refTarget`.
- **Estados nativos** (`states.native`): `:hover`, `:focus-visible`, `:active` en CSS.
- **Estados controlados** (`states.controlled`): son props y llevan el atributo ARIA indicado en `aria`.
- **Slots:** respeta `allowedComponents`, `minItems`, `maxItems`, `mandatory`. Un slot es una prop o `children`.
- **Composición:** nunca pongas dentro lo que esté en `composition.forbiddenChildren`.
- **Tipos:** sin `any`. Exporta con nombre (`export function Button`), y exporta el tipo de props (`ButtonProps`).
- **React:** si el proyecto usa React 19, `ref` es una prop normal; con React 18, usa `forwardRef`.
- **`"use client"`:** solo en componentes con estado, eventos o hooks. Nada más.
- **Comportamiento accesible complejo** (Checkbox, RadioGroup, Switch, AlertDialog): usa los primitivos de Radix (`radix-ui`) para el comportamiento y aplica nuestros estilos con `data-*`. No reimplementes foco, teclado ni ARIA a mano.

## Reglas de estilo

- Los valores salen **solo** de `tokens.bindings` del contrato. Ni hex, ni px sueltos, ni colores fuera de los tokens.
- Un token del contrato se convierte en variable CSS así: ruta con puntos → guiones, con prefijo `--`.
  `colors.accent.accent.9` → `var(--colors-accent-accent-9)`; `spacing.3` → `var(--spacing-3)`.
- Plantillas `{color.step}.9`: resuelve `tokens.scales.<color>.step` y repite el CSS por cada valor de `color`.
- `byHighContrast` solo sobrescribe lo que indica. `byState.disabled` aplica con `disabled` o `aria-disabled`.
- `opacity` solo con los valores numéricos que da el contrato (hover/active). **Disabled nunca con opacity.**
- Modo oscuro: no escribas nada. Las variables cambian con `data-theme="dark"`.
- Medidas sin token (alturas, tamaños de icono) salen de `layout`: úsalas como valores del componente.

## Iconos

- Solo iconos de `design-system/icons/registry.json`, importados desde `src/components/icon/icons.ts` (generado). Nunca `import * as` ni imports directos de `lucide-react` en componentes.
- Se dibujan con el componente `Icon` (contrato `Icon.contract.json`). Sin `label` es decorativo (`aria-hidden`); con `label`, `role="img"`.
- El tamaño lo fija el componente padre por CSS según su `size` (`layout.iconSize` del contrato). El color se hereda (`currentColor`).
- Si necesitas un icono que no está en el registry, no lo importes: pregunta.

## Accesibilidad

Cumple `a11y` del contrato: rol, nombre accesible, teclado, foco visible, área mínima, contraste. Si `minTarget` avisa de que no se cumple, haz pulsable también la etiqueta o añade padding invisible, y dilo en el resumen.

## Cosas que no haces

- No inventas props, variantes, estados ni tokens.
- No tocas `design-system/`.
- No editas `tokens.css` (se regenera).
- No instalas librerías sin preguntar (`lucide-react` y `radix-ui` ya están decididas).
- No creas componentes que no tengan contrato.
- No importas iconos fuera del registry.

## Cuando dudes

Pregunta. Si algo no está en el contrato, no lo rellenes con suposiciones.

## Al terminar

Si la skill `contract-to-component` está instalada, úsala para crear o actualizar componentes. Antes de dar por bueno un componente, ejecuta:
`node design-system/skills/contract-to-component/scripts/conformance.mjs src/components/<nombre> --ds design-system` (0 errores).

Responde con una lista corta:
1. Archivos creados o cambiados.
2. Reglas del contrato aplicadas.
3. Qué has dejado fuera o te ha hecho dudar (lo de `meta.needsReview` que afecta al código).
4. Cómo probarlo (ruta del playground).
