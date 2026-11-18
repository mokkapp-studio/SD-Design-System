# Clase: un sistema de diseño, muchas webs

**Duración:** 2 h, en dos tutoriales de 1 h.

| | Dónde | Resultado |
|---|---|---|
| **Tutorial 1** | Este repo (el sistema de diseño) | Los componentes de referencia, generados desde sus contratos y visibles en **Storybook** (claro y oscuro). Es el catálogo que consulta todo el equipo |
| **Tutorial 2** | Un proyecto Next.js nuevo | El sistema como **submódulo**: tokens, iconos y reglas instalados con la skill `ds-install`, y componentes generados con `contract-to-component`. **Sin Storybook**: el catálogo está en el sistema |

```text
SD-Design-System (este repo)            web-1, web-2 … web-5 (Next.js)
├── contracts/   ← fuente de verdad      ├── design-system/   ← submódulo de este repo
├── tokens/      ← variables CSS         ├── src/app/globals.css   ← tokens (ds-install)
├── icons/       ← registry              ├── src/components/        ← generados desde los contratos
├── skills/      ← contract-to-component └── (sin Storybook)
│                  ds-install
├── components/  ← referencia + stories
└── .storybook/  ← el catálogo
```

Cinco webs con el mismo estilo = cinco proyectos con el mismo submódulo. Un cambio en un contrato o un token se hace **una vez aquí** y cada web lo recibe con `npm run ds:sync`.

## Antes de la clase (docente)

- [ ] Node 20+, Git y Claude Code en todos los equipos.
- [ ] Este repo en GitHub con todo en `main` (la rama que usan alumnos y submódulos). Los alumnos necesitan la URL: `git@github.com:mokkapp-studio/SD-Design-System.git`.
- [ ] En este repo: `npm i && npm run conformance:self` debe dar **23/23**.
- [ ] Haz los dos tutoriales una vez tú (unos 20 min con todo instalado).

**Consigna fija para la IA:** los contratos están en `draft` y tienen huecos en `meta.needsReview`. En clase no se resuelven: «lo que esté en needsReview, márcalo `TODO(contract)` y sigue».

---

# Tutorial 1 · Storybook en el sistema de diseño (1 h)

## 1.1 Preparar el repo (0:00–0:15)

```bash
git clone <url-de-este-repo> SD-Design-System
```

```bash
cd SD-Design-System && npm i
```

React, los iconos y Storybook (sin asistente: así todos instalan lo mismo):

```bash
npm i react react-dom @phosphor-icons/react
```

```bash
npm i -D storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y vite @types/react @types/react-dom
```

Iconos del registry (el componente Icon los usa):

```bash
mkdir -p components/icon && node scripts/build-phosphor-icons.mjs components/icon/icons.ts
```

Crea estos archivos.

**`.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
};
export default config;
```

**`.storybook/preview.tsx`** (los tokens y el selector de tema; el modo oscuro lo da `tokens.css`, nadie escribe CSS para dark)

```tsx
import type { Decorator, Preview } from '@storybook/react-vite';
import '../tokens/tokens.css';

const withTheme: Decorator = (Story, ctx) => {
  document.documentElement.dataset.theme = String(ctx.globals.theme ?? 'light');
  document.body.style.background = 'var(--tokens-colors-page-background)';
  return Story();
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [withTheme],
  parameters: { a11y: { test: 'todo' } },
};
export default preview;
```

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["components", ".storybook"]
}
```

Y en `package.json`, dentro de `"scripts"`:

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"conformance": "node skills/contract-to-component/scripts/conformance-all.mjs components --ds ."
```

**Comprobación:** `npm run storybook` abre `http://localhost:6006` (vacío todavía) y `npm run check` da 0 errores.

## 1.2 Demo: Icon (0:15–0:25)

Abre Claude Code en la carpeta del repo (sesión nueva: carga las skills de `.claude/skills/`).

```
Con la skill contract-to-component, crea Icon desde contracts/Icon.contract.json en components/icon/
(icons.ts ya existe). Lo que esté en meta.needsReview, márcalo TODO(contract) y sigue.
Pasa el verificador con: npm run conformance
Después escribe components/icon/icon.stories.tsx (tipos de @storybook/react-vite) con todos los tamaños,
los dos pesos y todos los iconos del registry.
```

Enséñalo en este orden: la copia del contrato junto al componente, la cabecera `@contract Icon@x.y.z`, el CSS (solo `var(--…)`), la story en Storybook y el verificador:

```bash
npm run conformance
```

Rompe algo a propósito (un `color: red`, una prop de más) y vuelve a ejecutarlo: el error dice qué regla del contrato se ha saltado.

## 1.3 Práctica por grupos (0:25–0:50)

Cada grupo genera 2–3 componentes en orden, con su story:

| Grupo | Componentes | Necesita |
|---|---|---|
| 1 | Badge, Divider, Link | Icon |
| 2 | Button, IconButton | Icon |
| 3 | Checkbox, Switch, TextField | Icon, IconButton |
| 4 | RadioGroup, TextArea | — |
| 5 | NavbarItem, FooterColumn | Link |

**Ampliación o deberes** (dependen de los anteriores; se hacen cuando estos ya existen en `components/`):

| Componente | Necesita | Ojo |
|---|---|---|
| FormField | TextField, Icon | Su slot `control` lleva el campo |
| Form | FormField, Checkbox, Button, Badge, Icon | El más largo: 20 puntos en `needsReview` |
| Navbar | NavbarItem, Button, IconButton | Menú móvil con `open` |
| Footer | FooterColumn, Divider, IconButton, Icon | FooterColumn usa Link |
| AlertDialog | Button | Compuesto (dos archivos). Su anatomía usa `Heading` y `Text`, que **no tienen contrato**: usa `h2` y `p` y márcalo `TODO(contract)` |

Icon, IconLibrary y PhosphorIconLibrary no son componentes que se pinten por separado: Icon se hace en la demo y los otros dos describen el registro de iconos.

Prompt por componente:

```
Con la skill contract-to-component, crea <Componente> desde contracts/<Componente>.contract.json
en components/<id>/. Reutiliza lo que ya hay en components/. Lo que esté en meta.needsReview,
márcalo TODO(contract) y sigue. Pasa npm run conformance hasta 0 errores y escribe
<id>.stories.tsx con todas las variantes, tamaños y estados (y el modo controlado si tiene estado).
```

Pistas para el docente:

- Los de formulario y los compuestos tardan más: `gen-css` no genera sus estados y parte del CSS se escribe a mano (el verificador lo comprueba igual).
- **Compuestos (RadioGroup, AlertDialog):** las partes van en `<id>-parts.tsx` con `'use client'` y el objeto `{ Root, Item }` se exporta desde `<id>.tsx` sin él. Si no, `<RadioGroup.Root>` falla en las webs Next.js; el verificador lo avisa.
- Si una story necesita estado, se hace con un componente con nombre (`function ControlledDemo() { … }`), no con un hook dentro de `render`.

## 1.4 Puesta en común (0:50–1:00)

- Storybook con todos los componentes. Cambia a **Dark** en la barra.
- Pestaña **Accessibility** de cada story (addon-a11y): qué detecta.
- `npm run conformance`: todos a 0 errores.
- `grep -rn "TODO(contract)" components`: cada TODO es una decisión de diseño pendiente, que vuelve al **contrato**, no al código.
- Commit: los componentes de referencia quedan en el sistema y Storybook es el catálogo para todo el equipo (`npm run build-storybook` genera una web estática que se puede publicar).

---

# Tutorial 2 · Una web Next.js alimentada por el sistema (1 h)

## 2.1 Crear el proyecto (0:00–0:10)

```bash
npx create-next-app@latest mi-web --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"
```

```bash
cd mi-web
```

```bash
git submodule add <url-de-este-repo> design-system
```

(El submódulo sigue la rama principal, `main`. Para otra rama: `git submodule add -b <rama> <url> design-system`.)

## 2.2 Instalar el sistema con la skill `ds-install` (0:10–0:20)

Enlaza la skill (una vez; después se enlaza sola):

```bash
mkdir -p .claude/skills && ln -s ../../design-system/skills/ds-install .claude/skills/
```

Abre Claude Code en `mi-web` (sesión nueva) y pide:

```
Instala el sistema de diseño de design-system/ en este proyecto con la skill ds-install:
tokens en globals.css e iconos de Phosphor. Enséñame antes lo que vas a cambiar (dry-run).
```

La skill pregunta si los tokens van por **import** (recomendado: `@import` de `tokens.css`, siempre al día) o **copy** (las variables se pegan en `globals.css`, dentro de `:root` y `[data-theme="dark"]`, entre marcas; se refrescan con `npm run ds:sync`). Después ejecuta su script, que:

| Cambia | Para qué |
|---|---|
| `src/app/globals.css` | tokens como variables CSS; sustituye la plantilla de create-next-app (hex y modo oscuro propio) |
| `src/app/layout.tsx` | `data-theme="light"` en `<html>` |
| `src/components/icon/icons.ts` | iconos del registry del sistema (e instala `@phosphor-icons/react`) |
| `package.json` | `ds:check`, `ds:conformance`, `ds:icons`, `ds:sync` |
| `tsconfig.json`, `eslint.config.mjs` | no revisan `design-system/` |
| `AGENTS.md`, `CLAUDE.md` | añade las reglas del sistema sin tocar el bloque de Next.js |
| `.claude/skills/` | enlaza `contract-to-component` |

Sin IA, el mismo resultado con un comando:

```bash
node design-system/skills/ds-install/scripts/install.mjs --tokens import --icons phosphor
```

Borra `src/app/page.module.css` (la plantilla trae colores hex; el script lo avisa) y deja `src/app/page.tsx` en `export default function Home() { return <main />; }`.

**Comprobación:**

```bash
npm run ds:check && npx tsc --noEmit && npm run dev
```

La página sale con el fondo y el texto de los tokens. Cambia `data-theme` a `"dark"` en `layout.tsx`: todo cambia sin tocar CSS.

## 2.3 Generar los componentes en la web (0:20–0:45)

Sesión nueva de Claude Code (para que cargue `contract-to-component`). Por cada componente que necesite la web, en orden (Icon primero):

```
Con la skill contract-to-component, crea <Componente> desde design-system/contracts/<Componente>.contract.json
en src/components/<id>/. Si existe design-system/components/<id>/, parte de esa implementación de referencia.
Lo que esté en meta.needsReview, márcalo TODO(contract) y sigue. Sin stories: el catálogo está en el sistema.
Pasa npm run ds:conformance hasta 0 errores.
```

Partir de la implementación de referencia (la del Tutorial 1) hace que las cinco webs tengan el mismo código; el verificador comprueba igualmente que cumple el contrato.

## 2.4 La página (0:45–0:55)

```
Crea la página de inicio en src/app/page.tsx usando solo componentes de src/components/:
<describe la página: cabecera, bloque principal con título y botones, formulario, pie…>.
Estilos de página solo con CSS Modules y variables de los tokens. Si falta un componente, para y dímelo.
```

Antes de cada commit:

```bash
npm run ds:conformance && npm run lint && npm run build
```

## 2.5 Cuando cambia el sistema (0:55–1:00)

1. Se cambia el contrato o el token **en el repo del sistema** (contrato primero, con su `version`), se hace commit y push.
2. En cada web:

```bash
npm run ds:sync
```

   Actualiza el submódulo y vuelve a aplicar tokens e iconos.
3. `npm run ds:conformance` falla en los componentes cuyo contrato cambió («la copia no es idéntica», «@contract atrasado»).
4. «Con contract-to-component, actualiza <Componente> a su contrato nuevo.»
5. Commit en la web, incluido el puntero del submódulo (`git add design-system`).

---

## Ejercicios para casa

1. Segunda web con el mismo sistema en 15 minutos: `create-next-app`, submódulo, `ds-install`, tres componentes.
2. Resolver tres `TODO(contract)`: proponer el cambio en el contrato (con versión nueva), regenerar en el sistema y propagarlo a la web con `ds:sync`.
3. Publicar el Storybook del sistema (`npm run build-storybook`) como catálogo del equipo.

> Ensayado con Next.js 16.4, React 19.3 y Storybook 10.6: Icon, Badge y RadioGroup pasan `conformance`, `tsc`, `lint`, `next build` y `storybook build`, en claro y en oscuro; `ds-install` es repetible sin duplicar nada.
