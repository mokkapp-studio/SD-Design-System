---
name: ds-install
description: Instala el sistema de diseño (añadido como submódulo en design-system/) en un proyecto Next.js — tokens como variables CSS en globals.css (:root y modo oscuro), iconos del registry, tema en <html>, scripts ds:*, reglas para la IA y skills enlazadas — y lo mantiene al día. Úsala cuando pidan "instala el sistema de diseño", "añade los tokens a globals.css", "instala los iconos", "prepara el proyecto para generar componentes" o "actualiza los tokens del sistema".
---

# ds-install

Prepara un proyecto Next.js para consumir el sistema de diseño **sin copiar nada a mano**: todo sale del submódulo. Después, los componentes se generan con `contract-to-component`. El proyecto web no lleva Storybook: el catálogo vive en el repo del sistema.

## Reglas

1. **No edites nada dentro de `design-system/`.** Si algo del sistema está mal (un token, un icono que falta), se cambia en su repo y aquí se actualiza el submódulo.
2. **No escribas valores de tokens a mano** en el CSS del proyecto. Las variables salen de `tokens.css` del sistema, por `@import` o copiadas entre marcas por el script.
3. **Iconos solo del registry** del sistema (`icons/<librería>/registry.json`). Si falta uno, se añade allí.
4. **El modo oscuro no se escribe:** se cambia `data-theme` en `<html>` y las variables cambian solas.

## Paso 0 — Comprobar

- El proyecto tiene `package.json` con `next` y App Router (`src/app` o `app`).
- El submódulo existe: `design-system/contracts/component.schema.json`. Si no: `git submodule add <url> design-system` (pide la URL; no la inventes).

## Paso 1 — Preguntar dos cosas (AskUserQuestion), si no lo han dicho

1. **Tokens:** `import` (recomendado: `@import` de `tokens.css`, siempre al día con el submódulo) o `copy` (las variables se pegan dentro de `globals.css`, en `:root` y `[data-theme="dark"]`, entre marcas `@ds-tokens`; se refrescan con `npm run ds:sync`).
2. **Iconos:** `phosphor` (por defecto del sistema) o `lucide`.

## Paso 2 — Ejecutar

```bash
node design-system/skills/ds-install/scripts/install.mjs --tokens <import|copy> --icons <phosphor|lucide>
```

Primero con `--dry-run` si el proyecto no está recién creado, y enseña lo que hará. El script es idempotente: repetirlo no duplica nada. Hace:

| Paso | Qué cambia |
|---|---|
| tokens | `app/globals.css`: tokens del sistema (import o copia). Si es la plantilla de create-next-app (hex y modo oscuro propio), la sustituye |
| theme | `data-theme="light"` en `<html>` de `app/layout.tsx` |
| icons | instala la librería y genera `components/icon/icons.ts` desde el registry |
| scripts | `ds:check`, `ds:conformance`, `ds:icons`, `ds:sync` en `package.json` |
| config | `tsconfig.json` y `eslint.config.mjs` no revisan `design-system/` |
| rules | añade `AGENTS.nextjs.md` al `AGENTS.md` del proyecto entre marcas (respeta el bloque de Next.js) y `@AGENTS.md` en `CLAUDE.md` |
| skills | enlaza `contract-to-component` y `ds-install` en `.claude/skills/` |

## Paso 3 — Verificar

```bash
npm run ds:check
```

```bash
npx tsc --noEmit
```

Y `npm run dev`: la página debe tener el fondo y el texto de los tokens. Para probar el modo oscuro, cambia a `data-theme="dark"`.

## Paso 4 — Resumen

Lista corta: modo de tokens e iconos elegidos, archivos cambiados (la salida del script), avisos («Revisa:») y el siguiente paso: «Con contract-to-component, crea Icon desde design-system/contracts/Icon.contract.json».

## Mantener

- **Cambió el sistema** (tokens, iconos, contratos): `npm run ds:sync` (actualiza el submódulo y vuelve a aplicar tokens e iconos). Después `npm run ds:conformance`: los componentes con contrato nuevo fallan y se regeneran con `contract-to-component`.
- **Solo un paso:** `--only tokens` o `--only icons`.
