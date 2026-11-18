# Clase: del contrato a Storybook (y a la web)

**Duración:** 2 h. **Resultado:** un proyecto Next.js que usa este repo como submódulo, con los componentes generados desde sus contratos por la skill `contract-to-component`, verificados y visibles en Storybook (claro y oscuro). En una segunda sesión, con esos mismos componentes se construye una página web.

Este repo no tiene componentes a propósito: aquí viven contratos, tokens, iconos y skills. El código se genera en el proyecto que lo consume. La solución de referencia (Button, Checkbox, Icon, Switch e IconButton ya hechos) está en el tag `solucion-clase`.

## Antes de la clase (docente)

- [ ] Node 20+, Git y Claude Code instalados en todos los equipos.
- [ ] Este repo publicado en GitHub (los alumnos necesitan la URL para el submódulo).
- [ ] `npm i && npm run conformance:self` en este repo: debe dar **23/23**. Si no, el verificador tiene un agujero.
- [ ] Ensayo en seco: genera un componente simple (Badge) y uno compuesto (RadioGroup) siguiendo esta guía.
- [ ] Reparte los grupos (tabla de la práctica).

## Reglas que se dicen al principio

1. **El contrato manda.** Si el código y el contrato no coinciden, se arregla el código; si el contrato está mal, se cambia primero el contrato (en este repo), nunca en el proyecto.
2. **Nada se da por bueno sin `npm run ds:conformance` a 0 errores.**
3. **`meta.needsReview`:** los contratos están en `draft` y tienen huecos. En clase no se resuelven: la consigna es «márcalo `TODO(contract)` y sigue». Esos TODO se repasan al final.

---

## Paso 1 · Crear el proyecto (0:15–0:35)

```bash
npx create-next-app@latest mi-web --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"
```

```bash
cd mi-web
```

```bash
git submodule add <url-de-este-repo> design-system
```

Enlaza las skills (así se actualizan con el submódulo):

```bash
mkdir -p .claude/skills && ln -s ../../design-system/skills/contract-to-component .claude/skills/ && ln -s ../../design-system/skills/ui-contract-builder .claude/skills/
```

Reglas del proyecto:

```bash
cp design-system/AGENTS.nextjs.md AGENTS.md && printf '@AGENTS.md\n' > CLAUDE.md
```

Tokens: al principio de `src/app/globals.css`:

```css
@import '../../design-system/tokens/tokens.css';
```

Y en `src/app/layout.tsx`, `<html lang="es" data-theme="light">`.

Iconos:

```bash
npm i @phosphor-icons/react && node design-system/scripts/build-phosphor-icons.mjs src/components/icon/icons.ts
```

Scripts en `package.json`:

```json
"ds:check": "node design-system/check.mjs design-system",
"ds:conformance": "node design-system/skills/contract-to-component/scripts/conformance-all.mjs src/components --ds design-system"
```

### Storybook

```bash
npx storybook@latest init
```

Elige el framework de Next.js con Vite si lo pregunta. Después, en `.storybook/preview.ts`, carga los tokens y añade el selector de tema (el modo oscuro lo da `tokens.css`; los componentes no escriben nada para dark):

```ts
import type { Decorator, Preview } from '@storybook/nextjs-vite';
import '../design-system/tokens/tokens.css';

const withTheme: Decorator = (Story, ctx) => {
  document.documentElement.dataset.theme = String(ctx.globals.theme ?? 'light');
  return Story();
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: { title: 'Tema', icon: 'circlehollow', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [withTheme],
};
export default preview;
```

Borra las stories de ejemplo que crea el instalador (`src/stories/`).

**Comprobación:** `npm run storybook` abre Storybook vacío; `npm run ds:check` da 0 errores; en Claude Code (sesión nueva) «¿qué skills tienes?» lista `contract-to-component`.

## Paso 2 · Demo en directo: Icon (0:35–0:50)

Prompt:

```
Con la skill contract-to-component, crea Icon desde design-system/contracts/Icon.contract.json
en src/components/icon/ (icons.ts ya existe). Lo que esté en meta.needsReview, márcalo TODO(contract) y sigue.
Después escribe icon.stories.tsx con todos los tamaños y los iconos del registry.
```

Enseña en este orden: el contrato copiado junto al componente, la cabecera `@contract Icon@x.y.z`, el CSS (solo `var(--…)`), y el verificador:

```bash
npm run ds:conformance
```

Rompe algo a propósito (un `color: red`, una prop de más) y vuelve a ejecutarlo: el error dice qué regla del contrato se ha saltado.

## Paso 3 · Práctica por grupos (0:50–1:40)

Cada grupo genera sus componentes **en orden** (un componente puede necesitar otro ya hecho). Para cada uno: componente, `ds:conformance` a 0 errores, story con todas sus variantes, tamaños y estados.

| Grupo | Componentes | Depende de |
|---|---|---|
| 1 | Divider, Badge, Link | Icon |
| 2 | Button, IconButton | Icon |
| 3 | Checkbox, Switch, TextField, TextArea | Icon, IconButton |
| 4 | RadioGroup, FormField, AlertDialog | Button, TextField |
| 5 | NavbarItem, Navbar, FooterColumn, Footer, Form | casi todos |

Los grupos 4 y 5 dependen de los demás: dales los componentes del tag `solucion-clase` para no esperar, o que empiecen por la parte que no depende de nadie. Los de formulario y los compuestos tardan más: `gen-css` no genera sus estados y parte del CSS se escribe a mano (el verificador lo comprueba igual).

Prompt por componente:

```
Con la skill contract-to-component, crea <Componente> desde design-system/contracts/<Componente>.contract.json.
Reutiliza lo que ya hay en src/components/. Lo que esté en meta.needsReview, márcalo TODO(contract) y sigue.
Pasa el verificador hasta 0 errores y escribe <id>.stories.tsx con todas las variantes, tamaños y estados.
```

Si el agente se desvía, las respuestas están en `docs/prompts-nextjs.md` (sección «Cuando el agente se desvía»).

## Paso 4 · Puesta en común (1:40–1:55)

- Storybook con todos los componentes; cambia a **Dark** en la barra: nadie ha escrito CSS para dark.
- `npm run ds:conformance` en el proyecto de un grupo: todos a 0 errores.
- Lista de `TODO(contract)`: `grep -rn "TODO(contract)" src/components`. Cada uno es una decisión de diseño pendiente que vuelve al contrato, no al código.

## Paso 5 · Cierre: cuando cambia el contrato (1:55–2:00)

1. Se cambia el contrato en **este repo** y se sube su `version`.
2. En el proyecto: `git submodule update --remote design-system`.
3. `npm run ds:conformance` falla en ese componente («la copia no es idéntica», «@contract atrasado»): el cambio se detecta solo.
4. «Con contract-to-component, actualiza <Componente> a su contrato nuevo.»

---

## Segunda sesión · La web

Con los componentes ya hechos:

```
Crea la página de inicio en src/app/page.tsx usando solo componentes de src/components/:
Navbar arriba, un bloque principal con título, texto y dos Button, un Form de contacto y Footer.
Ningún estilo nuevo fuera de CSS Modules con tokens; si falta un componente, para y dímelo.
```

Antes de cada commit del proyecto: `npm run ds:conformance`, `npm run build` y `npm run lint`.

## Ejercicios para casa

1. Resolver tres `TODO(contract)`: proponer el cambio en el contrato (con su versión nueva) y regenerar el componente.
2. Añadir una prop a un contrato (minor), actualizar el componente y su story.
3. Nivel 2 de paridad (`skills/contract-to-component/references/parity.md`): comparar los valores computados en Storybook con los tokens, en claro y en oscuro.
