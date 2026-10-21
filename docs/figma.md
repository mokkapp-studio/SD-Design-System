# Usar el contrato con Figma

Figma y el contrato no se actualizan entre sí: **se comparan**. Si no coinciden, decides cuál es el correcto y cambias el otro.

## 1. Prepara el componente en Figma

- **Variables con nombre por uso**, no por aspecto: `color/fill/brand/default`, no `azul-fuerte`. Dos niveles: primitivos y semánticos.
- **Component set** con propiedades limpias:
  - Variant → variantes visuales (`Variant`, `Size`).
  - Boolean → interruptores (`Loading`, `Disabled`, `Full width`).
  - Text → etiquetas (`Label`).
  - Instance swap → intercambiar un icono (`Icon start`, `Icon end`).
  - Slot → huecos que reciben contenido libre (`Header`, `Body`, `Footer`).
- **Auto layout** en todo, y capas con nombre estable: `root`, `icon`, `label`... las mismas claves que `anatomy`.
- **Descripción** del componente: pega `description` del contrato y la ruta `contracts/<Componente>.contract.json`.

## 2. Qué se corresponde con qué

| En Figma | En el contrato |
| --- | --- |
| Nombre del component set | `name` |
| Propiedad del componente | `props[]` con `bindings.figma.property` y `.type` |
| Variantes `Hover`, `Focus`, `Pressed` | `states.native` |
| Variantes o booleanos `Disabled`, `Loading`, `Error` | `states.controlled` |
| Nombres de capas | claves de `anatomy` |
| Propiedad de slot o instance swap | `anatomy.<parte>.slot.figmaProp` |
| Panel de auto layout | `layout.autoLayout` |
| Variables aplicadas | `tokens.bindings` |
| Enlace al nodo | `anchors.figma.file` y `.node` |

El nombre en `bindings.figma.property` debe ser **idéntico** al de Figma, mayúsculas incluidas.

## 3. Qué NO está en Figma

`description`, `guidance`, `a11y` y `events` los decides tú (con desarrollo). Puedes dejar una anotación en Figma que apunte al contrato, pero la fuente es el contrato.

## 4. Flujo: de Figma al contrato

**A mano:** pasos 4–7 de `docs/contract-guide.md`.

**Con Claude y el MCP de Figma (sin skill):**

1. Pásale el enlace del componente (clic derecho → copiar enlace a la selección).
2. Prompt:
   > Lee este componente de Figma: <enlace>. Usa `contracts/_template.contract.json` y `docs/contract-guide.md`. Rellena solo lo que se pueda deducir de Figma: `name`, `props` (con `bindings.figma`), `states`, `anatomy`, `layout`, `tokens.bindings` y `anchors`. Deja `description`, `guidance` y `a11y` con placeholders. Anota en `meta.needsReview` todo lo dudoso. Guarda en `contracts/<Componente>.contract.json` y ejecuta `node check.mjs`.
3. Revisa tú el resultado. La IA acierta lo mecánico y falla en la intención.

## 5. Flujo: comprobar que Figma y contrato coinciden

> Compara el componente de Figma <enlace> con `contracts/<Componente>.contract.json`. Lista: (1) propiedades de Figma que faltan en el contrato, (2) props del contrato sin propiedad en Figma, (3) capas que no están en `anatomy`, (4) valores sin variable. No modifiques nada.

Hazlo cada vez que cambie el componente en Figma y antes de pedir cambios de código.

## 6. Qué no hacer

- No escribas medidas ni colores sueltos en el contrato: referencia tokens.
- No renombres una propiedad en Figma sin cambiar `bindings.figma.property` (y subir `version` a major si cambia la API).
- No uses `opacity` para disabled: tokens `*.disabled`.
