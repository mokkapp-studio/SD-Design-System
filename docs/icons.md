# Iconos (Lucide)

El sistema usa [Lucide](https://lucide.dev/icons/) a través del paquete `lucide-react`. Hay una lista cerrada de iconos permitidos y un componente `Icon` que fija tamaño y accesibilidad.

```
icons/registry.json  ──(npm run icons:build)──►  icons.ts (reexporta solo los permitidos)
        ▲                                              │
  aquí se declaran                          los componentes importan de aquí
```

## Piezas

| Pieza | Para qué |
| --- | --- |
| `icons/catalog.json` | TODO Lucide (1.903 iconos) con tags y categorías. Generado; no se edita a mano |
| `icons/registry.json` | Lista de iconos permitidos en código, con su uso. **Fuente de verdad** |
| `scripts/build-icons.mjs` | Genera el archivo de reexportación a partir del registry |
| `scripts/build-icon-catalog.mjs` | Genera `icons/catalog.json` desde Lucide (`npm run icons:catalog`) |
| `scripts/build-figma-icons.mjs` | Genera lotes de código para crear los iconos en Figma (`npm run icons:figma`) |
| `contracts/Icon.contract.json` | Contrato del componente `Icon` (tamaño, a11y) |
| `contracts/IconLibrary.contract.json` | Reglas de la librería: catálogo, nombres, trazo y paso a Figma |
| `check.mjs` | Valida el registry (PascalCase, sin duplicados, con `use`) y que cada icono exista en el catálogo |

## 1. Instalarlo en el proyecto Next.js (una vez)

```bash
npm install lucide-react
```

Genera el archivo de iconos **dentro del proyecto** (así se resuelve `lucide-react` desde su `node_modules`):

```bash
node design-system/scripts/build-icons.mjs src/components/icon/icons.ts
```

Añade el script a `package.json`:

```json
"ds:icons": "node design-system/scripts/build-icons.mjs src/components/icon/icons.ts"
```

Se genera `src/components/icon/icons.ts`:

```ts
import { ArrowRight, Check, Plus, Search, X /* … */ } from 'lucide-react';
export type { LucideIcon } from 'lucide-react';
export { ArrowRight, Check, Plus, Search, X /* … */ };
```

Después, crea el componente `Icon` desde su contrato (prompt en `docs/prompts-nextjs.md`, apartado «Iconos»).

## 2. Declarar un icono nuevo

1. Busca el nombre en [lucide.dev/icons](https://lucide.dev/icons/). En código el nombre va en **PascalCase** (`arrow-right` → `ArrowRight`).
2. Añádelo a `icons/registry.json` con su uso:

```json
{ "name": "Download", "use": "descargar un archivo" }
```

3. `npm run icons:build` en el repo del sistema (o `npm run ds:icons` en el proyecto) y `npm run check`.
4. Commit en el repo del sistema y, en el proyecto, actualiza el submodule.

Si el nombre no existe en Lucide, TypeScript falla al compilar: es la comprobación.

## 3. Usarlo en los componentes

Los componentes con hueco de icono (`Button.icon`, `Button.iconEnd`, `IconButton.icon`, `TextField.icon`) reciben un nodo. Quien los usa pasa un icono ya dibujado por `Icon`:

```tsx
import { Plus, ArrowRight } from '@/components/icon/icons';
import { Icon } from '@/components/icon/icon';
import { Button } from '@/components/button/button';

<Button icon={<Icon icon={Plus} />}>Añadir</Button>
<Button iconEnd={<Icon icon={ArrowRight} />}>Continuar</Button>
```

Botón solo con icono (el `aria-label` es obligatorio):

```tsx
import { X } from '@/components/icon/icons';
import { IconButton } from '@/components/icon-button/icon-button';

<IconButton icon={<Icon icon={X} />} aria-label="Cerrar" variant="ghost" color="neutral" />
```

- **Tamaño:** lo fija el componente padre con CSS según su `size` (Button e IconButton: 16 / 16 / 18 / 20; TextField: 14 / 16 / 16). No lo pases a mano.
- **Color:** hereda `currentColor`; el padre ya le da su color por tokens.
- **Accesibilidad:** sin `label`, el icono es decorativo (`aria-hidden`). Con `label` lleva `role="img"` y `aria-label`.
- **Solo icono:** un botón sin texto no es un `Button` con icono, es un `IconButton` (`contracts/IconButton.contract.json`) con `aria-label` obligatorio.

Importar siempre desde `icons.ts` y nunca `import * as` de `lucide-react`: solo así se incluyen en el paquete los iconos permitidos.

## 4. Catálogo completo y paso a Figma

- **Catálogo:** `icons/catalog.json` contiene todo Lucide (1.903 iconos) con tags y categorías. Se genera con `npm run icons:catalog`, que descarga Lucide en `.cache/` la primera vez (`--update` para refrescarlo).
- **Registry:** `icons/registry.json` sigue siendo la lista de iconos que el código puede usar. El catálogo es el universo; el registry, su subconjunto permitido.
- **Figma:** `npm run icons:figma` prepara lotes de código en `.cache/figma/` para crear los iconos como componentes en Figma vía MCP (`use_figma`). Por defecto usa el registry; `--all`, `--category` o `--names` cambian la selección.

## 5. Reglas para el agente

- Solo iconos de `icons/registry.json`. Si necesita otro, búscalo en `icons/catalog.json` y propón la entrada para el registry (nombre en PascalCase y `use`); no lo añadas sin preguntar.
- No pinta ni dimensiona el icono por su cuenta.
- Después de añadir uno: `icons:build` y `check`.

## 6. Alternativa: Phosphor

El sistema ofrece [Phosphor](https://phosphoricons.com) como segunda librería. **Un proyecto elige una de las dos y no las mezcla.** Las reglas están en `contracts/PhosphorIconLibrary.contract.json`; el circuito es el mismo que con Lucide, en `icons/phosphor/`:

| Pieza | Lucide | Phosphor |
| --- | --- | --- |
| Catálogo (generado) | `icons/catalog.json` · `npm run icons:catalog` | `icons/phosphor/catalog.json` · `npm run phosphor:catalog` (1.512 iconos, desde `phosphor-icons/core`) |
| Registry (fuente de verdad) | `icons/registry.json` | `icons/phosphor/registry.json` |
| Reexportación | `npm run icons:build` | `npm run phosphor:build` |
| Figma | `npm run icons:figma` → `.cache/figma/` | `npm run phosphor:figma` → `.cache/figma-phosphor/` |
| Contrato | `IconLibrary` | `PhosphorIconLibrary` |

Diferencias que importan:

- **Pesos:** Phosphor tiene 6; el sistema permite **regular** (por defecto) y **fill** (solo para el estado activo o seleccionado del mismo icono). En Figma, cada icono es un component set con la propiedad `Weight` (Regular / Fill).
- **Nombres:** el paquete exporta `MagnifyingGlassIcon`; el registry y `icons.ts` usan `MagnifyingGlass`. Así los componentes importan igual con las dos librerías.
- **Dibujo:** rejilla de 16 px (viewBox 256) y formas con relleno, no trazo. En Figma, el color va en el relleno (`--fill-variable`).
- **Next.js:** `icons.ts` importa desde `@phosphor-icons/react/ssr` (sin contexto, sirve en Server y Client Components). Opcional: añade `@phosphor-icons/react` a `experimental.optimizePackageImports`.
- **Equivalencias del registry inicial:** ChevronDown → CaretDown, EyeOff → EyeSlash, Search → MagnifyingGlass, Trash2 → Trash; el resto se llama igual.

En el proyecto Next.js que use Phosphor:

```bash
npm install @phosphor-icons/react
node design-system/scripts/build-phosphor-icons.mjs src/components/icon/icons.ts
```

Pendiente: `Icon.contract.json` está escrito para Lucide (tipo `LucideIcon`, sin `weight`). Para usar fill a través de `Icon`, primero hay que cambiar ese contrato.

## Para revisar

- **Figma:** los componentes de Radix usan sus propios iconos (por defecto, «Design / blending-mode»). Con Lucide el aspecto cambia: revisa cada instance swap en Figma.
- **Trazo:** `strokeWidth` 2 es el valor por defecto de Lucide. Los iconos de Radix son de 15px con otro trazo; decide si ajustas a 1.5.
- **Server Components:** los iconos de `lucide-react` no usan estado; si Next.js se queja en algún caso, añade `"use client"` al componente que los importe.
- **Registro inicial:** 11 iconos de ejemplo; cámbialos por los que uses.
