# Plantilla de la Spec

Cabeceras en inglés; contenido en el idioma del contrato. Un bloque sin dato en el contrato se omite.

```
# Documentation
## Overview        Definition · Usage Guidelines (+ Label) · Behavior and Interactions
## Anatomy         Component Breakdown · Specs · Properties (+ #### Code) · Tokens · Breakpoints · Motion
## Accessibility   incluye el contraste medido de la variante dibujada
## History         git log del contrato
```

## De dónde sale cada bloque

| Bloque | Contrato | Figma (`figma.json`) |
| --- | --- | --- |
| Definition | `description` | — |
| Usage Guidelines | `guidance.dos`, `donts`, `related`; `content.label` | — |
| Behavior and Interactions | `states`, `events`, `behavior.loading`, `behavior.overflow` | — |
| Component Breakdown | `anatomy` (+ imagen de anatomía) | relleno, borde, radio y estilo de texto por capa, con su cadena de alias |
| Specs | `layout` (+ imagen de cotas) | padding, gap y tamaño medidos |
| Properties | `props` | — |
| Code | `props` + `tokens.bindings` (JSON de consulta) y `tsx` de uso; enlace al contrato completo | — |
| Tokens | `tokens.bindings` con `var(--…)` | — |
| Breakpoints, Motion | `behavior.responsive`, `behavior.motion` | — |
| Accessibility | `a11y` | contraste medido (paso 5) |
| History | `git log` de `contracts/<Componente>.contract.json` | — |

## Reglas de los datos

- El enlace al contrato es un **permalink de GitHub** (remoto + SHA), nunca una ruta local. Sin remoto GitHub, el script deja un comentario para añadirlo a mano.
- Un valor de Figma sin variable se escribe `valor · sin token`; no se sustituye por un token supuesto.
- «Code» lleva el JSON condensado (props, y `tokens.bindings` si caben en 6 KB). El contrato entero queda en el enlace.

## Imágenes

- Anatomía: fondo oscuro, marcadores magenta numerados que coinciden con la columna `#` de Component Breakdown.
- Specs: cotas azules (ancho/alto), banda verde = padding, banda naranja = espacio entre partes.
- Se exportan con `exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } })` y entran como `![alt](data:image/png;base64,…)`. Es una foto: se regenera con la Spec.
- Los dibujos viven en una Section «Building blocks · <Componente>» de la página de utilidades (parámetro `HELPERS_PAGE` de los scripts), fuera de la Section del componente.

## Publicar

- Primera vez: `figma.spec.createOnCanvasAsync({ title, content })`; devuelve `{ specNodeId }`.
- Regenerar: `figma.spec.setContent({ specNodeId, content })` con la Spec entera. `editContent` solo sirve para cambios puntuales (cada `oldText` debe coincidir una vez).
- Si `setContent` falla con «ambiguous table column correspondence» (las tablas nuevas cambian de columnas respecto a las actuales), vacía antes: `setContent({ specNodeId, content: '# Documentation\n' })` y escribe la Spec completa en una segunda llamada.
- Exporta los PNG y codifícalos (`figma.base64Encode`) dentro del mismo script que escribe la Spec; el base64 no debe pasar por tu contexto.
- Relectura: `figma.spec.getContent({ specNodeId })` → `.markdown`. Devuelve las imágenes como URL (`…/image/<sha>?w=&h=`) y las tablas normalizadas (`|---|`); `--verify` lo admite.
- Alto de la Section del componente = max(Spec, columna) + 80.
- El botón «full size» de la Spec no tiene API: se pulsa a mano en la UI.
