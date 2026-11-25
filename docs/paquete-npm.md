# Clase · De contratos a paquete npm (en local)

**Qué vamos a construir:** el sistema de diseño (contratos + tokens) se convierte en **componentes React con su Storybook**, después en **un paquete npm**, y ese paquete se instala en **una web Next.js** como cualquier librería de UI.

Todo en local: sin publicar en internet, sin cuentas y sin GitHub. GitHub solo se usa una vez, para descargar el repo.

> Esta guía vive en `docs/paquete-npm.md` y viaja con el repo. Cuando un prompt dice «como en la guía», Claude la lee de ahí. No la borres de tu copia.

---

## 0 · Antes de empezar

### Lo que necesita cada alumno en su ordenador

| Herramienta | Comprobar | Si falta |
|---|---|---|
| Node.js 20 o superior | `node -v` | nodejs.org, versión LTS |
| Git | `git --version` | En Mac se ofrece instalarlo al escribir el comando |
| Claude Code | `claude --version` | claude.com/claude-code |

### Las dos carpetas de la clase

Hay **dos proyectos distintos**. Uno fabrica el paquete y el otro lo usa:

```text
~/Desktop/
├── SD-Design-System-main-npm/       ← EL SISTEMA: aquí se FABRICA el paquete (fases 1–5)
└── aaa/
    └── prueba-ds/                   ← LA WEB Next.js: aquí se USA el paquete (fase 6)
```

En los comandos se usan **rutas completas** (`~/Desktop/…`) para que funcionen estés donde estés. Si tus carpetas están en otro sitio o se llaman distinto, cambia solo estas dos rutas en toda la guía:

- **Sistema:** `~/Desktop/SD-Design-System-main-npm`
- **Web:** `~/Desktop/aaa/prueba-ds`

Cada paso empieza con **📍**, que indica en qué carpeta tiene que estar la terminal. Para saber dónde estás, escribe `pwd`.

### Cómo usar los prompts

1. Abre una terminal en la carpeta del 📍.
2. Escribe `claude` y pulsa Enter.
3. Pega el prompt del paso.
4. Al terminar, haz tú la **✅ Comprobación** del paso.

Cada paso se puede hacer **a mano** (comandos y archivos de la guía) o **con el prompt**: el resultado es el mismo.

### Guion y tiempos

| Fase | 📍 | Qué se hace | Tiempo |
|---|---|---|---|
| 1 · Preparar | Sistema | Descargar el repo, Git y comprobar el punto de partida | 5 min |
| 2 · Storybook | Sistema | Instalar React y Storybook desde cero | 15 min |
| 3 · Componentes | Sistema | Generar componentes con la IA y verlos en Storybook | 40 min |
| 4 · Compilar | Sistema | Convertir los componentes en código instalable | 15 min |
| 5 · Empaquetar | Sistema | Crear el archivo `.tgz`: el paquete | 2 min |
| 6 · Usar | **Web** | Crear Next.js, instalar el paquete y usarlo | 20 min |
| 7 · Cambiar algo | Sistema → Web | El ciclo de actualización | 10 min |

---

## Fase 1 · Preparar el sistema

### 1.1 · Descargar el repo

1. En GitHub, abre `mokkapp-studio/SD-Design-System` → botón **Code** → **Download ZIP**.
2. Descomprímelo en el Escritorio y renombra la carpeta a `SD-Design-System-main-npm`.

> El ZIP se descarga sin historial de Git y sin conexión con GitHub: es tu copia de trabajo y no subes nada a ningún sitio.

### 1.2 · Git y comprobaciones

📍 **Sistema**

```bash
cd ~/Desktop/SD-Design-System-main-npm
```

**Qué hay ahora:** contratos (`contracts/`), tokens (`tokens/`), iconos permitidos (`icons/`), skills para la IA (`skills/`), scripts (`scripts/`) y documentación (`docs/`, donde está esta guía). No hay componentes ni nada instalado.

**Qué hacemos:**
1. **Git local:** guarda el historial dentro de la carpeta, sin subir nada, para poder volver atrás.
2. **`npm i`:** instala lo que el proyecto ya declara (TypeScript, que usa el verificador).
3. **Comprobar** que contratos, tokens y verificador están sanos.

```bash
git init && git add -A && git commit -m "Punto de partida"
```

```bash
npm i
```

```bash
npm run check && npm run conformance:self
```

> **Prompt:**
> ```
> Estoy en la carpeta del sistema de diseño, recién descargada.
> 1. Inicializa Git y haz un commit "Punto de partida" con todo.
> 2. Ejecuta npm i.
> 3. Ejecuta npm run check y npm run conformance:self y dime el resultado.
> No instales nada más.
> ```

✅ **Comprobación:** `0 errores` y `23/23 errores sembrados detectados`.

---

## Fase 2 · Instalar Storybook desde cero

📍 **Sistema**

**Qué es Storybook:** una web local donde se ve **cada componente aislado**, con sus variantes, tamaños y estados, y controles para cambiar sus props. Es el **catálogo del sistema**. Vive aquí, en el sistema: las webs no lo llevan.

**Por qué no `npx storybook init`:** ese asistente instala tests y un navegador de varios cientos de MB que no necesitamos, crea ejemplos de demo y hace preguntas. A mano son 4 pasos, y todos acabáis con lo mismo.

### 2.1 · Instalar React y Storybook

```bash
npm i -D react react-dom @phosphor-icons/react @types/react @types/react-dom vite storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y
```

`-D` = de desarrollo: sirven para construir y ver los componentes; **no viajan dentro del paquete**.

| Paquete | Qué es |
|---|---|
| `react`, `react-dom` | La librería de los componentes |
| `@phosphor-icons/react` | Los iconos del sistema |
| `@types/react`, `@types/react-dom` | Para que TypeScript entienda React |
| `vite` | El compilador que usa Storybook (y luego el paquete) |
| `storybook`, `@storybook/react-vite` | Storybook y su conexión con React + Vite |
| `@storybook/addon-docs` | Página de documentación automática por componente |
| `@storybook/addon-a11y` | Pestaña **Accessibility**: contraste, nombres accesibles… |

✅ **Comprobación:** `npx storybook --version` muestra un número (10.x).

### 2.2 · Los tres archivos de configuración

| Archivo | Qué es | Dónde |
|---|---|---|
| `tsconfig.json` | Cómo lee TypeScript los componentes | Raíz del sistema |
| `.storybook/main.ts` | Qué carga Storybook: dónde están las historias y qué extras | Carpeta `.storybook/` |
| `.storybook/preview.tsx` | Cómo se pinta cada historia: carga los tokens y añade el botón Light/Dark | Carpeta `.storybook/` |

La carpeta `.storybook` empieza por punto, así que el Finder no la muestra. En la terminal se ve con `ls -a`.

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

- `jsx`: entiende `<Button />`.
- `strict`: detecta errores de tipos.
- `noEmit`: solo revisa; quien compila es Vite.
- `types`: entiende `import styles from './x.module.css'`.
- `include`: solo revisa `components/` y `.storybook/`.

**`.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.tsx'],               // dónde están las historias
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'], // documentación y accesibilidad
  framework: '@storybook/react-vite',                         // React compilado con Vite
};
export default config;
```

**`.storybook/preview.tsx`**

```tsx
import type { Decorator, Preview } from '@storybook/react-vite';
import '../tokens/tokens.css'; // colores, tipografía y espacios del sistema

// El botón Tema pone data-theme="light" o "dark" en <html>; los tokens cambian solos.
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
};
export default preview;
```

> **Prompt (crea los tres archivos):**
> ```
> Crea la configuración de Storybook para este repo. No uses `npx storybook init` ni instales nada.
> 1. tsconfig.json en la raíz: target ES2022, lib DOM + DOM.Iterable + ES2022, module ESNext,
>    moduleResolution Bundler, jsx react-jsx, strict, noEmit, skipLibCheck, types ["vite/client"],
>    include ["components", ".storybook"].
> 2. .storybook/main.ts con framework @storybook/react-vite, historias en ../components/**/*.stories.tsx
>    y addons @storybook/addon-docs y @storybook/addon-a11y.
> 3. .storybook/preview.tsx que importe ../tokens/tokens.css y añada en la barra un selector "Tema"
>    Light/Dark que ponga data-theme en <html> y el fondo con var(--tokens-colors-page-background).
> 4. Crea la carpeta components/ vacía.
> Usa exactamente el contenido de la fase 2.2 de docs/paquete-npm.md. Al final, explícame en una línea qué hace cada archivo.
> ```

✅ **Comprobación:** `ls -a .storybook` muestra `main.ts` y `preview.tsx`, y existe `tsconfig.json`.

### 2.3 · Scripts en `package.json`

Un **script** es un atajo: `npm run <nombre>` ejecuta el comando que tiene asociado.

Dentro de `"scripts"` en `package.json`, añade:

```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build",
"conformance": "node skills/contract-to-component/scripts/conformance-all.mjs components --ds ."
```

| Script | Qué hace |
|---|---|
| `npm run storybook` | Abre Storybook en `http://localhost:6006` y se actualiza al guardar |
| `npm run build-storybook` | Genera el catálogo como web estática (`storybook-static/`) |
| `npm run conformance` | Comprueba que cada componente cumple su contrato |

Y añade al `.gitignore` la línea `storybook-static/` (es generado).

> **Prompt:**
> ```
> En package.json, dentro de "scripts", añade sin borrar los que hay:
> "storybook": "storybook dev -p 6006",
> "build-storybook": "storybook build",
> "conformance": "node skills/contract-to-component/scripts/conformance-all.mjs components --ds ."
> Añade storybook-static/ al .gitignore. Comprueba que package.json sigue siendo JSON válido
> y que Storybook arranca con: npx storybook dev -p 6006 --smoke-test --ci
> Haz commit "Storybook instalado".
> ```

### 2.4 · Arrancar Storybook

```bash
npm run storybook
```

✅ **Comprobación:**
- Se abre `http://localhost:6006` con Storybook vacío.
- En la terminal aparece `No story files found…`. **Es normal:** aún no hay componentes.

Deja esta terminal abierta, con Storybook funcionando. Para lo demás, abre **otra pestaña** de terminal en la carpeta del sistema. Para parar Storybook: `Ctrl + C`.

---

## Fase 3 · Crear los componentes

📍 **Sistema** (en la segunda pestaña de terminal)

### 3.1 · Iconos y puerta de entrada

**Iconos permitidos.** Solo se usan los del registro del sistema (`icons/phosphor/registry.json`). Este script genera el archivo que los exporta:

```bash
mkdir -p components/icon && node scripts/build-phosphor-icons.mjs components/icon/icons.ts
```

**`components/index.ts`: la puerta de entrada del paquete.** Es un archivo **nuevo** que creas tú. Lo que se exporta aquí es lo único que una web podrá importar.

```bash
printf "// Todo lo que una web puede importar del paquete.\nexport * from './icon/icons';\n" > components/index.ts
```

Crece con cada componente; la IA añade su línea. Con Icon y Badge quedaría así:

```ts
export * from './icon/icons';                // los iconos
export { Icon } from './icon/icon';          // el componente
export type { IconProps } from './icon/icon'; // el tipo de sus props (autocompletado en la web)
export { Badge } from './badge/badge';
export type { BadgeProps } from './badge/badge';
```

### 3.2 · Cómo trabaja la skill `contract-to-component`

Ya viene en el repo (`.claude/skills/`). Por cada componente:
1. Lee su contrato en `contracts/`.
2. Crea `components/<id>/` con:
   - `<id>.tsx`: el componente;
   - `<id>.module.css`: sus estilos, solo con tokens;
   - una copia del contrato.
3. Pasa el verificador hasta **0 errores**.
4. Escribe su historia `<id>.stories.tsx` y lo exporta en `index.ts`.

Abre **Claude Code en sesión nueva** en la carpeta del sistema, para que cargue las skills.

### 3.3 · El primero: Icon

> **Prompt:**
> ```
> Con la skill contract-to-component, crea Icon desde contracts/Icon.contract.json en components/icon/.
> - components/icon/icons.ts ya existe: úsalo y no lo cambies.
> - Lo que esté en meta.needsReview, márcalo TODO(contract) en el código y sigue, sin preguntarme.
> - Pasa `npm run conformance` hasta 0 errores.
> - Escribe components/icon/icon.stories.tsx (tipos de @storybook/react-vite) con: una historia con controles,
>   una con todos los tamaños y pesos, y una con todos los iconos del registro.
> - Añade a components/index.ts: export { Icon } y export type { IconProps } desde './icon/icon'.
> Al terminar, lista los archivos creados y los TODO(contract) que quedan.
> ```

✅ **Comprobación:**
- **Icon** aparece en Storybook.
- Con **Tema → Dark** cambia de color solo.
- `npm run conformance` dice `1/1`.

```bash
git add -A && git commit -m "Icon"
```

### 3.4 · El resto, en orden

| Orden | Componentes | Necesitan |
|---|---|---|
| 1 | Badge, Divider, Link | Icon |
| 2 | Button, IconButton | Icon |
| 3 | Checkbox, Switch, TextField, TextArea, RadioGroup | Icon, IconButton |
| 4 | NavbarItem, FooterColumn | Link |
| 5 | FormField, Navbar, Footer, Form, AlertDialog | Casi todos los anteriores |

> **Prompt (uno por componente; cambia `<Componente>` y `<id>`, p. ej. `Button` y `button`):**
> ```
> Con la skill contract-to-component, crea <Componente> desde contracts/<Componente>.contract.json en components/<id>/.
> - Reutiliza los componentes que ya existen en components/; no los dupliques.
> - Lo que esté en meta.needsReview, márcalo TODO(contract) y sigue, sin preguntarme.
> - Si es compuesto (Nombre.Root, Nombre.Item…): partes en <id>-parts.tsx con 'use client'
>   y el objeto { Root, Item, … } exportado desde <id>.tsx SIN 'use client'.
> - Pasa `npm run conformance` hasta 0 errores.
> - Escribe <id>.stories.tsx (tipos de @storybook/react-vite): controles, todas las variantes, tamaños y estados.
>   Si una historia necesita estado, usa un componente con nombre (function ControlledDemo), no un hook en render.
> - Añade a components/index.ts el componente y su tipo de props.
> Al terminar, lista los archivos creados y los TODO(contract) que quedan.
> ```

✅ **Comprobación de cada uno:**
- aparece en Storybook, en Light y en Dark;
- `npm run conformance` sigue a 0 errores;
- guárdalo con `git add -A && git commit -m "<Componente>"`.

---

## Fase 4 · Compilar: de componentes a paquete

📍 **Sistema**

**Qué es compilar.** Los componentes están en TypeScript con CSS Modules, y una web no los puede usar así. Compilar los convierte en **JavaScript + un CSS** dentro de la carpeta `dist/`. **`dist/` es lo que irá dentro del paquete.**

### 4.1 · Herramientas de compilación

```bash
npm i -D @vitejs/plugin-react vite-plugin-dts rollup-plugin-preserve-directives
```

| Paquete | Qué hace |
|---|---|
| `@vitejs/plugin-react` | Vite entiende React |
| `vite-plugin-dts` | Genera los tipos: la web tendrá autocompletado de props |
| `rollup-plugin-preserve-directives` | Mantiene `'use client'`; sin él, los componentes con estado fallan en Next.js |

### 4.2 · Los archivos del paquete

| Archivo | Qué es |
|---|---|
| `vite.config.ts` | Las instrucciones para compilar `components/` en `dist/` |
| `scripts/build-package.mjs` | Copia tokens y contratos a `dist/`, porque Vite solo compila componentes |
| `package.json` | El «DNI» del paquete: nombre, versión, qué se puede importar y qué necesita |

**`vite.config.ts`** (raíz del sistema)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import preserveDirectives from 'rollup-plugin-preserve-directives';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['components'], exclude: ['**/*.stories.tsx'], entryRoot: 'components' }), // tipos, sin historias
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: { entry: 'components/index.ts', formats: ['es'], cssFileName: 'styles' }, // entrada y un único styles.css
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@phosphor-icons\/react($|\/)/], // los pone la web, no el paquete
      output: { preserveModules: true, preserveModulesRoot: 'components', entryFileNames: '[name].js' }, // un archivo por componente
      plugins: [preserveDirectives()], // conserva 'use client'
    },
  },
});
```

**`scripts/build-package.mjs`**

```js
#!/usr/bin/env node
// Copia a dist/ lo que Vite no compila: tokens (la web los necesita) y contratos (reglas para la IA de la web).
import fs from 'node:fs';
fs.copyFileSync('tokens/tokens.css', 'dist/tokens.css');
fs.copyFileSync('tokens/tokens.json', 'dist/tokens.json');
fs.mkdirSync('dist/contracts', { recursive: true });
for (const f of fs.readdirSync('contracts').filter((f) => f.endsWith('.contract.json') && !f.startsWith('_')))
  fs.copyFileSync(`contracts/${f}`, `dist/contracts/${f}`);
console.log('✔ dist/: tokens y contratos copiados');
```

**`package.json`**: quita `"private": true` y añade estas claves. Los `scripts` y `devDependencies` actuales se quedan.

```json
{
  "name": "@mokkapp-studio/design-system",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/styles.css",
    "./tokens.css": "./dist/tokens.css",
    "./tokens.json": "./dist/tokens.json",
    "./contracts/*": "./dist/contracts/*"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@phosphor-icons/react": "^2.1.0"
  }
}
```

| Clave | Qué significa |
|---|---|
| `name` | Cómo se instala e importa: `@mokkapp-studio/design-system` |
| `version` | Sube con cada cambio (fase 7) |
| `files` | Solo `dist/` entra en el paquete |
| `exports` | Lo único que la web puede importar: componentes, `styles.css`, `tokens.css`, contratos |
| `sideEffects` | Que Next.js no descarte los `.css` |
| `peerDependencies` | «Necesito React y Phosphor; usa los de la web» |

Y en `"scripts"`:

```json
"build": "npm run check && npm run conformance && vite build && node scripts/build-package.mjs"
```

`build` **solo compila si todo cumple su contrato**.

> **Prompt (fase 4 completa):**
> ```
> Convierte este repo en un paquete npm siguiendo la fase 4 de docs/paquete-npm.md:
> 1. Instala como devDependencies @vitejs/plugin-react, vite-plugin-dts y rollup-plugin-preserve-directives.
> 2. Crea vite.config.ts y scripts/build-package.mjs exactamente como en la guía.
> 3. En package.json: quita "private"; pon name "@mokkapp-studio/design-system", version "0.1.0", type, files,
>    sideEffects, main, types, exports y peerDependencies como en la guía; añade el script "build".
>    No borres scripts ni devDependencies existentes.
> 4. Añade dist/ y *.tgz al .gitignore.
> 5. Ejecuta npm run build y comprueba que dist/ tiene index.js, index.d.ts, styles.css, tokens.css y contracts/,
>    y que los componentes con estado empiezan por "use client".
> Explícame el resultado y haz commit "Paquete npm".
> ```

✅ **Comprobación:** `ls dist` muestra `index.js`, `index.d.ts`, `styles.css`, `tokens.css`, `contracts/` y una carpeta por componente.

---

## Fase 5 · Empaquetar

📍 **Sistema**

Un paquete npm es **un archivo comprimido `.tgz`** con `dist/` y `package.json` dentro.

```bash
npm pack
```

✅ **Comprobación:**

```bash
ls ~/Desktop/SD-Design-System-main-npm/*.tgz
```

Debe salir `mokkapp-studio-design-system-0.1.0.tgz`. **Ese archivo es tu paquete.** Es el mismo que se subiría a internet si se publicara; aquí se queda en tu disco.

**Aquí termina el trabajo en el sistema.** Ahora vamos a la web.

---

## Fase 6 · Usar el paquete en una web Next.js

### 6.1 · Crear la web

📍 **La carpeta donde quieras la web** (aquí, `~/Desktop/aaa`)

```bash
mkdir -p ~/Desktop/aaa && cd ~/Desktop/aaa
```

```bash
npx create-next-app@latest prueba-ds --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"
```

Crea `prueba-ds/`: un Next.js con TypeScript, App Router y `src/`, sin Tailwind, porque los estilos salen de tus tokens. Si pregunta algo más, acepta lo que propone.

`create-next-app` no permite añadir paquetes durante la creación; se añaden justo después, en el paso siguiente.

### 6.2 · Instalar el paquete y los iconos (un solo comando)

📍 **Web**

```bash
cd ~/Desktop/aaa/prueba-ds
```

```bash
npm i ~/Desktop/SD-Design-System-main-npm/mokkapp-studio-design-system-0.1.0.tgz @phosphor-icons/react
```

- **Primera parte:** tu paquete, con la **ruta completa** al `.tgz`. Así funciona estés donde estés.
- **`@phosphor-icons/react`:** sí, se instala en la web, en el mismo comando. El paquete la declara como `peerDependency`: la necesita, pero no la trae dentro, para que la web tenga una sola copia de los iconos.

**Truco:** escribe `npm i ` (con espacio), arrastra el `.tgz` desde el Finder a la terminal y se pega su ruta exacta. Luego añade `@phosphor-icons/react`.

✅ **Comprobación:**

```bash
ls node_modules/@mokkapp-studio/design-system/dist
```

Y en `package.json` de la web, dentro de `"dependencies"`, aparecen `@mokkapp-studio/design-system` y `@phosphor-icons/react`.

> **Si sale `ENOENT … no such file` o `seems to be corrupted`:** la ruta al `.tgz` está mal; el paquete no está roto. Comprueba la ruta con `ls ~/Desktop/SD-Design-System-main-npm/*.tgz` o usa el truco de arrastrar.

### 6.3 · Conectar el sistema a la web

| Archivo | Qué cambia | Por qué |
|---|---|---|
| `src/app/layout.tsx` | Importa `tokens.css` y `styles.css`; `data-theme="light"` en `<html>` | Tokens y estilos para toda la web, y el tema |
| `src/app/globals.css` | Se sustituye entero | La plantilla trae colores propios que pisan los tokens |
| `src/app/page.module.css` | Se borra | Estilos de la plantilla de Next |
| `src/app/page.tsx` | Página de prueba con componentes del paquete | Comprobar que funciona |

**`src/app/layout.tsx`**: añade estas dos líneas encima de `import "./globals.css";`

```tsx
import '@mokkapp-studio/design-system/tokens.css';
import '@mokkapp-studio/design-system/styles.css';
```

y deja la etiqueta así: `<html lang="es" data-theme="light" …>`.

**`src/app/globals.css`**: todo su contenido pasa a ser:

```css
body {
  margin: 0;
  background: var(--tokens-colors-page-background);
  color: var(--tokens-colors-text);
}
```

**`src/app/page.tsx`**: ejemplo con componentes ya creados (usa los que tengas):

```tsx
import { Badge, CheckCircle, Icon, RadioGroup } from '@mokkapp-studio/design-system';

export default function Home() {
  return (
    <main style={{ padding: 32, display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Badge size="2" icon={<Icon icon={CheckCircle} />}>Instalado desde el paquete</Badge>
      <RadioGroup.Root>
        <RadioGroup.Item value="mensual">Mensual</RadioGroup.Item>
        <RadioGroup.Item value="anual">Anual</RadioGroup.Item>
      </RadioGroup.Root>
    </main>
  );
}
```

> **Prompt** (Claude Code abierto en la web):
> ```
> Este Next.js tiene instalado mi sistema de diseño: el paquete @mokkapp-studio/design-system.
> 1. En src/app/layout.tsx importa '@mokkapp-studio/design-system/tokens.css' y
>    '@mokkapp-studio/design-system/styles.css' antes de ./globals.css, y pon lang="es" y data-theme="light" en <html>.
> 2. Sustituye todo src/app/globals.css por: body con margin 0, background var(--tokens-colors-page-background)
>    y color var(--tokens-colors-text).
> 3. Borra src/app/page.module.css.
> 4. Crea en src/app/page.tsx una página de prueba con los componentes que exporta el paquete
>    (consulta node_modules/@mokkapp-studio/design-system/dist/index.d.ts).
> 5. Añade al final de AGENTS.md la sección "Sistema de diseño" de la fase 6.5 de
>    ~/Desktop/SD-Design-System-main-npm/docs/paquete-npm.md (la guía está en el sistema, no en la web).
> No crees ni copies componentes: impórtalos del paquete. Al final ejecuta npm run build.
> ```

### 6.4 · Arrancar y comprobar

```bash
npm run dev
```

✅ **Comprobación** en `http://localhost:3000`:
- se ve con los colores y la tipografía de los tokens;
- los componentes con estado responden (el RadioGroup selecciona);
- con `data-theme="dark"` en `layout.tsx`, todo pasa a oscuro sin tocar CSS;
- `npm run build` termina sin errores.

### 6.5 · Reglas para la IA de la web

Al final del `AGENTS.md` de la web (Next.js ya lo crea):

```md
## Sistema de diseño
- Los componentes vienen de `@mokkapp-studio/design-system`. No los recrees ni los copies: impórtalos.
- Sus reglas de uso: `node_modules/@mokkapp-studio/design-system/dist/contracts/<Componente>.contract.json`.
- Estilos propios de la web solo con variables de los tokens (`var(--…)`): ni hex ni px sueltos.
- Si falta un componente o una variante, no lo inventes: avísame.
```

---

## Fase 7 · Cuando cambia el sistema

El paquete instalado es una **copia**: los cambios del sistema no llegan solos a la web.

**1. 📍 Sistema.** Cambia el contrato (primero) y regenera el componente con la skill. Después:

```bash
cd ~/Desktop/SD-Design-System-main-npm && git add -A && git commit -m "Describe el cambio"
```

```bash
npm version patch && npm run build && npm pack
```

`npm version patch` sube la versión (0.1.0 → 0.1.1). Usa `minor` si añades algo y `major` si quitas o renombras.

**2. 📍 Web.** Instala el `.tgz` nuevo:

```bash
cd ~/Desktop/aaa/prueba-ds && npm i ~/Desktop/SD-Design-System-main-npm/mokkapp-studio-design-system-0.1.1.tgz
```

**3.** Reinicia la web. Si no ves el cambio, borra su caché:

```bash
rm -rf .next && npm run dev
```

---

## Si algo falla

| Síntoma | 📍 | Solución |
|---|---|---|
| `npx storybook --version` no responde | Sistema | Repite el comando de 2.1 |
| Storybook dice `No story files found` | Sistema | Normal hasta crear el primer componente |
| Storybook se ve sin colores | Sistema | Falta `import '../tokens/tokens.css'` en `.storybook/preview.tsx` |
| Un componente no sale en Storybook | Sistema | Falta su `<id>.stories.tsx` |
| `npm run build` se para en `conformance` | Sistema | Un componente incumple su contrato: corrígelo con la skill |
| `npm version`: «Git working directory not clean» | Sistema | Haz commit antes |
| `ENOENT` o `seems to be corrupted` al instalar | Web | Ruta del `.tgz` mal: usa la ruta completa o arrastra el archivo |
| `Module not found: @mokkapp-studio/design-system` | Web | No se instaló: repite 6.2 |
| Un componente importado da `undefined` | Sistema | Falta en `components/index.ts`; `build` y `pack` de nuevo |
| La web se ve sin estilos | Web | Faltan los dos `import` de CSS en `layout.tsx` |
| Error con `useState` o `createContext` en Next.js | Sistema | Falta `'use client'` o el compuesto no está en dos archivos |
| Los cambios no llegan a la web | Web | Instala el `.tgz` de la versión nueva y borra `.next` |
