# Iconos (Phosphor)

El sistema usa [Phosphor](https://phosphoricons.com) a través del paquete `@phosphor-icons/react`. Hay una lista cerrada de iconos permitidos y un componente `Icon` que fija tamaño, peso y accesibilidad. [Lucide](https://lucide.dev/icons/) queda como alternativa: **un proyecto usa una librería u otra, nunca las dos** (ver §6).

```
icons/phosphor/registry.json  ──(npm run phosphor:build)──►  icons.ts (reexporta solo los permitidos)
        ▲                                                  │
  aquí se declaran                          los componentes importan de aquí
```

## Piezas

| Pieza | Para qué |
| --- | --- |
| `icons/phosphor/catalog.json` | TODO Phosphor (1.512 iconos) con tags y categorías. Generado; no se edita a mano |
| `icons/phosphor/registry.json` | Lista de iconos permitidos en código, con su uso. **Fuente de verdad** |
| `scripts/build-phosphor-icons.mjs` | Genera el archivo de reexportación a partir del registry |
| `scripts/build-phosphor-catalog.mjs` | Genera `icons/phosphor/catalog.json` (`npm run phosphor:catalog`) |
| `scripts/build-phosphor-figma.mjs` | Genera lotes de código para crear los iconos en Figma (`npm run phosphor:figma`) |
| `contracts/Icon.contract.json` | Contrato del componente `Icon` (peso, tamaño, a11y) |
| `contracts/PhosphorIconLibrary.contract.json` | Reglas de la librería Phosphor: catálogo, nombres, pesos y paso a Figma |
| `contracts/IconLibrary.contract.json` | Reglas de la alternativa Lucide |
| `check.mjs` | Valida el registry (PascalCase, sin duplicados, con `use`) y que cada icono exista en el catálogo |

## 1. Instalarlo en el proyecto Next.js (una vez)

```bash
npm install @phosphor-icons/react
```

Genera el archivo de iconos **dentro del proyecto** (así se resuelve `@phosphor-icons/react` desde su `node_modules`):

```bash
node design-system/scripts/build-phosphor-icons.mjs src/components/icon/icons.ts
```

Añade el script a `package.json`:

```json
"ds:icons": "node design-system/scripts/build-phosphor-icons.mjs src/components/icon/icons.ts"
```

Se genera `src/components/icon/icons.ts`:

```ts
import { ArrowRightIcon, CheckIcon, PlusIcon, MagnifyingGlassIcon, XIcon /* … */ } from '@phosphor-icons/react/ssr';
export type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react';
export { ArrowRightIcon as ArrowRight, CheckIcon as Check, PlusIcon as Plus, MagnifyingGlassIcon as MagnifyingGlass, XIcon as X /* … */ };
```

Después, crea el componente `Icon` desde su contrato (prompt en `docs/prompts-nextjs.md`, apartado «Iconos»).

## 2. Declarar un icono nuevo

1. Busca el nombre en [phosphoricons.com](https://phosphoricons.com). En código el nombre va en **PascalCase** (`magnifying-glass` → `MagnifyingGlass`).
2. Comprueba que existe en `icons/phosphor/catalog.json`.
3. Añádelo a `icons/phosphor/registry.json` con su uso:

```json
{ "name": "Download", "use": "descargar un archivo" }
```

4. `npm run phosphor:build` en el repo del sistema (o `npm run ds:icons` en el proyecto) y `npm run check`.
5. Commit en el repo del sistema y, en el proyecto, actualiza el submodule.

Si el nombre no existe en Phosphor, TypeScript falla al compilar: es la comprobación.

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

Icono activo o seleccionado (peso `fill`):

```tsx
import { CheckCircle } from '@/components/icon/icons';

<Icon icon={CheckCircle} weight="fill" />
```

- **Peso:** `regular` por defecto. `fill` solo para el estado activo o seleccionado del mismo icono.
- **Tamaño:** lo fija el componente padre con CSS según su `size` (Button e IconButton: 16 / 16 / 18 / 20; TextField: 14 / 16 / 16). No lo pases a mano.
- **Color:** hereda `currentColor`; el padre ya le da su color por tokens.
- **Accesibilidad:** sin `label`, el icono es decorativo (`aria-hidden`). Con `label` lleva `role="img"` y `aria-label`.
- **Solo icono:** un botón sin texto no es un `Button` con icono, es un `IconButton` (`contracts/IconButton.contract.json`) con `aria-label` obligatorio.

Importar siempre desde `icons.ts` y nunca `import * as` ni imports directos de `@phosphor-icons/react`: solo así se incluyen en el paquete los iconos permitidos.

## 4. Catálogo completo y paso a Figma

- **Catálogo:** `icons/phosphor/catalog.json` contiene todo Phosphor (1.512 iconos) con tags y categorías. Se genera con `npm run phosphor:catalog` desde `phosphor-icons/core`.
- **Registry:** `icons/phosphor/registry.json` es la lista de iconos que el código puede usar. El catálogo es el universo; el registry, su subconjunto permitido.
- **Figma:** `npm run phosphor:figma` prepara lotes de código en `.cache/figma-phosphor/` (lotes `batch-NNN.js` y `entry.js`). En Figma se inserta siempre el componente **«Phosphor Icon»**: eliges el icono (propiedad `Icon`) y el peso (`Weight`). Al cambiar de icono se conserva el peso.

## 5. Reglas para el agente

- Solo iconos de `icons/phosphor/registry.json`. Si necesita otro, búscalo en `icons/phosphor/catalog.json` y propón la entrada para el registry (nombre en PascalCase y `use`); no lo añadas sin preguntar.
- Peso `regular` por defecto; `fill` solo para estado activo o seleccionado.
- No pinta, no redimensiona ni recolorea el icono por su cuenta.
- Después de añadir uno: `phosphor:build` y `check`.

## 6. Alternativa: Lucide

Un proyecto que use Lucide en lugar de Phosphor sigue el mismo circuito, en `icons/lucide/`. Las reglas están en `contracts/IconLibrary.contract.json`.

| Pieza | Lucide | Phosphor (por defecto) |
| --- | --- | --- |
| Catálogo (generado) | `icons/lucide/catalog.json` · `npm run lucide:catalog` | `icons/phosphor/catalog.json` · `npm run phosphor:catalog` |
| Registry (fuente de verdad) | `icons/lucide/registry.json` | `icons/phosphor/registry.json` |
| Reexportación | `npm run lucide:build` | `npm run phosphor:build` |
| Figma | `npm run lucide:figma` → `.cache/figma/` | `npm run phosphor:figma` → `.cache/figma-phosphor/` |
| Contrato | `IconLibrary` | `PhosphorIconLibrary` |
| Paquete | `lucide-react` | `@phosphor-icons/react` |

Con Lucide, el proyecto instala `lucide-react`, genera con `node design-system/scripts/build-lucide-icons.mjs src/components/icon/icons.ts` y usa `LucideIcon` como tipo. Sin `weight`: Lucide tiene un solo peso, con trazo de 2 px (`strokeWidth`).

Equivalencias entre las dos librerías del registry inicial: ChevronDown → CaretDown, EyeOff → EyeSlash, Search → MagnifyingGlass, Trash2 → Trash, menu → List, circle-check → CheckCircle.

## Para revisar

- **Figma:** los componentes de Radix usan sus propios iconos (por defecto, «Design / blending-mode»). Con Phosphor el aspecto cambia: revisa cada instance swap en Figma.
- **Peso:** Phosphor dibuja con relleno en rejilla de 16 px (viewBox 256), no con trazo. Radix Icons son de 15px con otro estilo: revisa el peso `regular` frente a Radix en Figma.
- **Server Components:** `icons.ts` importa de `@phosphor-icons/react/ssr`, sin contexto, así que sirve en Server y Client Components. Opcional: añade `@phosphor-icons/react` a `experimental.optimizePackageImports`.
- **Registro inicial:** 16 iconos de ejemplo; cámbialos por los que uses.
