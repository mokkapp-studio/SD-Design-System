# Guía del contrato

Cómo funciona `contracts/<Componente>.contract.json`, cómo rellenarlo, ejecutarlo y documentarlo. Ábrelo junto a `Button.contract.json` (componente con acción) y `TextField.contract.json` (campo con slots).

## 1. Qué es y qué no es

Un contrato es **datos sobre un componente**, no código ni diseño. Responde a: ¿para qué sirve?, ¿para qué no?, ¿qué props, partes, slots y estados tiene?, ¿qué tokens puede usar y dónde?, ¿cómo se hace accesible?

Principio: el contrato guarda **lo que ni el código ni Figma pueden decir solos** (intención, límites, reglas). Lo que se puede leer del código (`props.type`, `props.default`, medidas) está marcado en `meta.derivableFromSource`: es candidato a generarse en vez de escribirse.

## 2. Bloques núcleo y bloques opcionales

**Núcleo (obligatorios en todo componente):** `id`, `name`, `version`, `status`, `description`, `guidance`, `semantics`, `props`, `states`, `anatomy`, `tokens`, `a11y`.

**Opcionales:** quita de la plantilla los que no apliquen o déjalos en `null`.

| Tipo de componente | Añade además |
| --- | --- |
| Acción (Button, IconButton) | `events`, `layout`, `behavior` (loading), `content` |
| Contenedor (Panel, Modal) | `composition` + slots en `anatomy`, `layout` |
| Campo de formulario (Input, Select, Checkbox) | `form` (control, etiqueta, validación, mensaje de error), `events` |
| Capa (Dialog, Popover, Menu, Tooltip) | `overlay` (colocación, cierre, foco atrapado, capa z), `events` |
| Datos (Table, List) | `data` (filas, columnas, orden, selección, vacío, carga) |
| Media (Avatar, Image) | `media` (proporción, ajuste, fallback, texto alternativo) |
| Navegación (Tabs, Breadcrumb) | `composition`, `events`, `a11y.keyboard` extenso |

Con el tiempo, el contrato de un componente complejo crece; el de uno simple se queda en el núcleo.

## 3. Slots y composición

- **Slot**: hueco que recibe otro componente. Va en `anatomy.<parte>.slot` con `key`, `allowedComponents` (qué componentes caben), `minItems`, `maxItems`, `mandatory` y `figmaProp` (la propiedad de Figma que lo representa).
- **Contenido**: parte que se rellena con una prop de texto/nodo: `anatomy.<parte>.content.prop`.
- **Componente anidado fijo**: `composition.nestedComponents` (p. ej. un spinner siempre presente).
- **Prohibiciones**: `composition.forbiddenChildren` (Button no admite otro Button dentro).
- En el código, cada slot suele ser una prop (`header`, `footer`) o `children`. En el contrato, la prop se enlaza con `bindings.figma.type: "SLOT"` o `"INSTANCE_SWAP"`.

**Partes con nombre en Figma:** `figmaLayer` (nombre exacto de la capa) y `figmaToggle` (boolean de Figma que muestra u oculta una parte y no existe como prop en código, como `backdrop`). Así, ninguna propiedad de Figma queda sin correspondencia.

**API de código compuesta** (Radix, Ark, shadcn: Root, Trigger, Content…): descríbela en `composition.codeParts`; el contrato sigue siendo uno por componente.

Los tres casos se distinguen a propósito: slot (hueco), instance swap (cambiar un icono) y componente anidado (parte fija).

## 4. Tokens: política y enlaces

- `tokens.policy.allowed`: categorías de token que puede usar. `forbidden`: lo que nunca (`primitive`).
- `tokens.bindings.base`: lo que no cambia. `byVariant`: color por valor de `variant`. `byState`: estados controlados (`disabled`).
- Un token puede llevar `{prop}`: se expande con los valores de esa prop. `size.control.{size}` significa `size.control.s`, `.m` y `.l`.
- `null` significa «no aplica» (un primary no tiene borde).

### Cuando Figma y código no coinciden en el tipo de propiedad

- **Booleano en código, valor de variante en Figma** (`disabled` ↔ `state=disable`, `loading` ↔ `loading=true`): `bindings.figma` lleva `value` con el valor de Figma que equivale a `true`: `{ "property": "state", "type": "VARIANT", "value": "disable" }`.
- **Matriz de colores** (variant × color × estado × highContrast): `tokens.scales` mapea cada valor de `color` a sus rutas de token (`step`, `alpha`, `fg`…) y los bindings usan `{color.step}.9`. `null` = no existe para ese valor. `byHighContrast` solo guarda lo que cambia con la prop. `check.mjs` expande todas las combinaciones y comprueba que cada token exista.
- Los valores por defecto de Figma van marcados con ✦ (`solid ✦`). El contrato usa el valor sin marca.

## 5. Rellenarlo a mano, en 8 pasos

1. Copia `_template.contract.json` a `contracts/<Componente>.contract.json`.
2. Rellena `id`, `name`, `category`, `description`. Esto lo decides tú, no sale de Figma.
3. Escribe `guidance`: 2–4 `dos`, 2–4 `donts` con `useInstead`, y `related`.
4. Pasa las **propiedades de Figma** a `props`, con su `bindings.figma`. Nombres según `docs/components.md`.
5. Pasa las **variantes de interacción** a `states.native` y el resto a `states.controlled`.
6. Pasa las **capas** a `anatomy`. Los huecos van como `slot`.
7. Anota los **tokens** en `tokens.bindings`. Si algo en Figma no usa variable, no inventes un token: apúntalo en `meta.needsReview` y arréglalo en Figma.
8. Rellena `a11y` y `anchors`, borra los bloques opcionales que no uses, y ejecuta el check.

## 6. Ejecutarlo

```bash
node check.mjs        # o: npm run check
```

Sin dependencias (solo Node). Comprueba, por cada contrato:

- que están todos los bloques núcleo y que no quedan placeholders `<...>`;
- props y propiedades de Figma sin duplicados; `content.prop` apunta a una prop real;
- slots con `allowedComponents`; `refTarget` es una parte de `anatomy`;
- que cada token citado existe en `tokens.json`, no es `forbidden` y está en `allowed` (expande `{size}`);
- que los tokens de `tokens.json` apuntan a primitivos existentes.

Salida: errores (fallan con código 1) y avisos (`related` sin contrato, anchors pendientes). Además, `component.schema.json` valida el formato en el editor: al abrir un contrato en VS Code te marca los campos que faltan.

Sin Node, pídeselo a la IA: «Revisa `contracts/Button.contract.json` contra `tokens/tokens.json` y `AGENTS.md`. Lista errores, no cambies nada.»

## 7. Documentarlo

- **El contrato es la documentación fuente.** No escribas una segunda versión a mano.
- Para una página legible por personas, genérala: «Lee `Button.contract.json` y genera `button.md` con: descripción, do's y don'ts, tabla de props, estados, anatomía (con slots), tokens y accesibilidad. No inventes nada que no esté en el contrato.» Guárdala junto al componente en Next.js.
- `docs/components.md` es el índice. Actualízalo al crear o cambiar de estado un componente.
- Cada cambio: sube `version` (patch: texto; minor: prop o estado nuevo; major: renombrar o quitar) y haz commit del contrato primero.

## 8. Figma

Ver `docs/figma.md`.

## 9. La skill

`skills/ui-contract-builder/` hace los pasos 2–7 leyendo Figma (o una mini-spec si el componente es nuevo) y te deja claro lo que Figma no sabe (`description`, `guidance`, `a11y`) y lo que hay que revisar (`meta.needsReview`). Instalación y uso: `skills/ui-contract-builder/references/project-setup.md`.
