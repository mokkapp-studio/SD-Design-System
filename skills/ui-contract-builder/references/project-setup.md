# Instalar la skill en un proyecto

Las instrucciones valen igual para la skill hermana `contract-to-component` (implementa el componente en tsx desde el contrato). Instala las dos: la primera crea el contrato; la segunda lo convierte en código.

La skill es una carpeta (`ui-contract-builder/`). Se activa cuando Claude Code la encuentra en alguno de estos sitios:

| Dónde | Alcance |
| --- | --- |
| `~/.claude/skills/ui-contract-builder/` | Todos tus proyectos (personal) |
| `<proyecto>/.claude/skills/ui-contract-builder/` | Solo ese proyecto (se versiona con él) |

## Estructura mínima y recomendada

Mínima (funciona): `SKILL.md` con `name` y `description`.

Recomendada:

```text
ui-contract-builder/
├── SKILL.md                      procedimiento y reglas (corto)
├── references/                   se lee solo cuando hace falta
├── assets/                       esquema, plantilla y ejemplos
└── scripts/check.mjs             validador sin dependencias
```

## Opción 1 — Skill personal (la más simple)

```bash
mkdir -p ~/.claude/skills
cp -R design-system/skills/ui-contract-builder ~/.claude/skills/
```

Sirve en cualquier proyecto. Para actualizar, vuelve a copiar.

## Opción 2 — Dentro del repo del sistema de diseño

Deja la carpeta en `design-system/skills/ui-contract-builder/` (ya está). Quien trabaje en ese repo la tiene. Para que Claude Code la detecte en ese repo, enlázala:

```bash
mkdir -p .claude/skills
ln -s ../../skills/ui-contract-builder .claude/skills/ui-contract-builder
```

## Opción 3 — En un proyecto Next.js que usa el sistema como submódulo

```bash
# desde la raíz del proyecto Next.js
mkdir -p .claude/skills
ln -s ../../design-system/skills/ui-contract-builder .claude/skills/ui-contract-builder
git add .claude/skills
```

Así la skill se actualiza cuando actualizas el submódulo. Al crear contratos desde el proyecto Next.js:

- Se escriben en `design-system/contracts/` (el submódulo), **no** en `src/`.
- Hay que hacer commit y push **dentro del submódulo** y después subir el puntero en el proyecto (`git add design-system && git commit`).
- Mejor abrir una sesión de Claude Code en el repo del sistema de diseño para crear contratos, y usar el proyecto Next.js solo para consumirlos.

## Requisitos

- **Node 18+** para `scripts/check.mjs`.
- **MCP de Figma** conectado en Claude Code (para los modos A, C y D). Comprueba con `/mcp` que aparece y que has iniciado sesión. La instalación del servidor está en la documentación de Figma («Figma MCP server»).
- El archivo de Figma abierto o accesible con tu cuenta.

## Comprobar que funciona

1. Abre Claude Code en el proyecto (sesión nueva, para que cargue las skills) y pregunta «¿qué skills tienes disponibles?»: debe aparecer `ui-contract-builder`.
2. Prueba: «Con ui-contract-builder, comprueba los contratos de design-system/». Debe ejecutar `check.mjs` y darte el resumen.
3. Primer uso real: «Crea el contrato de este componente: <enlace de Figma>».

## Si no usas Claude Code

La skill solo existe como carpeta para Claude Code. En claude.ai puedes guardar `SKILL.md` como skill de tu cuenta, pero sin las carpetas `references/`, `assets/` y `scripts/`: usa entonces la versión del repo.
