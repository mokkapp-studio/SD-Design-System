# AGENTS.md

Reglas para cualquier agente de IA que trabaje con este sistema de diseño.

## Antes de crear o modificar un componente

1. Lee `contracts/<Componente>.contract.json`. Si no existe, **no lo inventes**: pídelo o créalo desde `contracts/_template.contract.json` y espera confirmación.
2. Lee los tokens en `tokens/` (la fuente es `tokens/tokens.json`; en código, las variables CSS de `tokens/tokens.css`, que se genera desde ella).
3. Consulta `docs/components.md` para el vocabulario de props y los componentes relacionados.

## Reglas

- **`description` y `guidance.donts`:** si la petición cae en un don't, avisa y propone el componente de `useInstead`.
- **Props:** nombres, tipos y valores por defecto exactamente como en `props`. No añadas props que no estén.
- **Estados:** los `states.native` se resuelven con CSS (`:hover`, `:focus-visible`, `:active`). Los `states.controlled` son props y llevan el atributo `aria` indicado.
- **Anatomía:** cada clave de `anatomy` es una parte; ponle `data-part="<clave>"`. El `ref` va en `semantics.refTarget`.
- **Slots:** respeta `slot.allowedComponents`, `minItems`, `maxItems` y `mandatory`. Un slot es una prop o `children`, según el contrato.
- **Composición:** nunca pongas dentro lo que esté en `composition.forbiddenChildren`.
- **Tokens:** usa solo lo definido en `tokens.bindings`, y solo categorías de `tokens.policy.allowed`. Nada de `tokens.policy.forbidden`, ni colores hex, ni px sueltos.
- **Modos:** nunca escribas valores distintos para dark; usa la variable CSS y el modo cambia solo (`[data-theme="dark"]`).
- **Tokens generados:** no edites `tokens.css`; cambia el JSON y ejecuta `npm run tokens:build`.
- **Disabled:** con los tokens `*.disabled`. Nunca con `opacity`.
- **Accesibilidad:** cumple `a11y` (nombre, teclado, foco visible, área mínima, contraste).
- **Si algo no está en el contrato:** pregunta. No rellenes huecos con suposiciones.

## Al terminar

1. Ejecuta `node check.mjs` si has tocado contratos o tokens.
2. Responde con una lista corta: qué reglas del contrato has aplicado y qué has dejado fuera o dudado.

## Cambios

Si el componente tiene que cambiar, se cambia **primero el contrato** (y su `version`), después el código.

## Componentes de referencia y Storybook

- Los componentes de referencia viven en `components/<id>/` (tsx, module.css, copia del contrato y `<id>.stories.tsx`). Se generan con la skill `contract-to-component` y pasan `npm run conformance` a 0 errores.
- Storybook (`npm run storybook`) es el catálogo del sistema. Las webs que lo consumen como submódulo no llevan Storybook: generan sus componentes desde los contratos (ver `docs/clase-storybook.md`).
- Componentes compuestos (`Nombre.Root`, `Nombre.Item`…): partes en `<id>-parts.tsx` con `'use client'` y el objeto exportado desde `<id>.tsx` sin él.

## Skills de este repo (`.claude/skills/`)

| Skill | Para qué |
|---|---|
| `ui-contract-builder` | Crear, comparar y sincronizar contratos desde Figma o una mini-spec |
| `component-spec` | Generar la Spec («Documentation») de un componente en Figma desde su contrato |
| `contract-to-component` | Contrato → componente React + TypeScript verificado (`npm run conformance`) |
| `ds-install` | Instalar el sistema en una web Next.js que lo usa como submódulo |
