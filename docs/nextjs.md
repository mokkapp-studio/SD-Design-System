# Llevarlo a Next.js

Objetivo: partir de un proyecto Next.js **vacío** y construir los componentes desde los contratos y los tokens, dejando el contrato como documentación al lado de cada componente.

## Estructura del proyecto Next.js

```
mi-proyecto/
├── AGENTS.md                       ← copia de este repo (reglas) + estructura del proyecto
├── design-system/                  ← copia de este repo (tokens/ y contracts/)
│   ├── tokens/tokens.css
│   └── contracts/
├── src/
│   ├── app/
│   │   └── globals.css             ← @import de design-system/tokens/tokens.css
│   └── components/
│       └── button/
│           ├── button.tsx          ← el componente
│           ├── button.module.css   ← estilos (solo variables CSS de los tokens)
│           ├── button.stories.tsx  ← story de Storybook (variantes, tamaños, estados)
│           ├── button.contract.json← copia del contrato: reglas para agentes
│           └── button.md           ← documentación legible, generada desde el contrato
```

El contrato junto al componente permite que un agente que abra la carpeta `button/` vea las reglas sin buscar en otro sitio.

## Cómo traer el repo (de más simple a más estable)

1. **Copiar** la carpeta `tokens/` y `contracts/` dentro de `design-system/`. Suficiente para los ejercicios.
2. **Git submodule** cuando quieras actualizar desde el repo del sistema: `git submodule add <url> design-system`.
3. Más adelante, un paquete publicado. No hace falta ahora.

## Instalar con la skill `ds-install` (con submódulo)

```bash
mkdir -p .claude/skills && ln -s ../../design-system/skills/ds-install .claude/skills/
```

Y en Claude Code: «Instala el sistema de diseño con la skill ds-install». O sin IA: `node design-system/skills/ds-install/scripts/install.mjs`. Pone los tokens en `globals.css`, los iconos, el tema, los scripts `ds:*`, las exclusiones de TypeScript y ESLint, las reglas y enlaza `contract-to-component`. La web no lleva Storybook: el catálogo vive en el sistema. La clase completa, paso a paso: [`clase-storybook.md`](clase-storybook.md).

## AGENTS.md del proyecto Next.js

Mínimo: añade `AGENTS.nextjs.md` al final del `AGENTS.md` que crea Next.js (no lo sobrescribas) y completa:

```md
## Este proyecto
- Contratos en `design-system/contracts/`, tokens en `design-system/tokens/tokens.json`.
- Cada componente vive en `src/components/<nombre>/` con `.tsx`, `.module.css` y su contrato copiado.
- Los estilos usan solo variables CSS definidas en `src/app/globals.css`.
- Antes de programar algo no trivial: modo plan, y espera mi aprobación.
```

## Flujo con el agente (Claude Code)

1. **Tokens → CSS.** En modo plan: «Lee `design-system/tokens/tokens.json` y propón cómo generar variables CSS en `globals.css`. No escribas código todavía.» Revisa el plan, aprueba.
2. **Contrato → componente.** «Lee `design-system/contracts/Button.contract.json` y crea `src/components/button/` con `button.tsx` y `button.module.css`. Cumple `AGENTS.md`. Al final, lista las reglas del contrato que aplicaste.»
3. **Documentar.** «Genera `button.md` desde `button.contract.json`, sin inventar nada que no esté en el contrato.»
4. **Verificar.** Pide una página de prueba con todas las variantes y tamaños y compárala con Figma. Después: «Revisa el componente contra el contrato y lista incumplimientos.»
5. **Siguiente componente.** Primero el contrato (en el repo del sistema), luego la copia en Next.js, luego el código.

## Si el componente necesita cambiar

Cambia primero el contrato en el repo del sistema (y su `version`), copia la nueva versión, y pide al agente que ajuste el código. Nunca al revés.

## Tokens y modo oscuro

```css
/* src/app/globals.css */
@import '../../design-system/tokens/tokens.css';
```

Pon `data-theme="light"` o `"dark"` en `<html>` (o la clase `.dark`). Los componentes usan solo `var(--colors-accent-accent-9)` y similares: el modo cambia los primitivos y el resto sigue.
