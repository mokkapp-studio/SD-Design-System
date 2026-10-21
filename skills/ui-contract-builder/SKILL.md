---
name: ui-contract-builder
description: Crea, actualiza y valida contratos de componentes UI (JSON) para un sistema de diseño, desde un componente de Figma o desde una mini-spec. Úsala cuando pidan "crea el contrato de <componente>", "contrato desde este nodo de Figma", "contrato de un componente nuevo (Navbar…)", "compara Figma con el contrato" o "genera el componente en Figma desde el contrato".
---

# ui-contract-builder

Un **contrato** es un JSON por componente: el acuerdo neutral entre Figma y código (props, estados, anatomía, tokens, accesibilidad, guía de uso). Esta skill lo crea y lo mantiene, en cualquier proyecto.

No genera código de componentes. Eso lo hace otra tarea que *lee* el contrato.

## Paso 0 — Localizar el sistema de diseño

1. Busca la carpeta con `contracts/component.schema.json` (en el directorio actual, en `design-system/` o en la que indique la persona). Es la **raíz del sistema**.
2. Si no existe, pregunta si quieres crearla: copia `assets/component.schema.json` y `assets/_template.contract.json` a `<raíz>/contracts/` y `scripts/check.mjs` a `<raíz>/check.mjs`.
3. Lee, si existen: `<raíz>/AGENTS.md`, `<raíz>/docs/components.md` (vocabulario de props, índice), `<raíz>/tokens/` (para saber qué tokens hay).
4. Si la raíz es un submódulo o una copia dentro de otro proyecto, **los contratos se escriben en la raíz del sistema**, no en el proyecto que lo consume. Avísalo.

## Reglas que no se negocian

1. **No cambies el esquema ni la estructura del contrato sin preguntar** (usa AskUserQuestion con 2–3 opciones). Cabe en campos libres (`composition`, `layout`, `behavior`, `meta`) sin tocar el esquema; dilo.
2. **Solo lo que la fuente dice.** Lo que no sepas leer o sea una suposición va a `meta.needsReview`, con la causa («instancia no legible», «valor sin variable»). Nunca inventes tokens ni los rellenes «por analogía» sin anotarlo.
3. **Los tokens son rutas que existen.** Si algo en Figma no usa variable, no escribas el valor suelto: anótalo en `needsReview`.
4. **Lecturas de Figma en solo lectura**, en trozos pequeños (la salida se corta a ~48 KB), con código a prueba de capas que falten.
5. **Si piden solo el JSON, entrega solo el JSON** (más los archivos dependientes que hayas cambiado). No regeneres ni empaquetes el proyecto.
6. **Contenido de producto** (`description`, `guidance`, `a11y`) lo redactas tú como borrador. Al entregar, di qué decisiones tomaste (valores por defecto, qué es un «no uses»).
7. **Nunca declares algo verificado si no lo leíste.** Distingue «leído en Figma» de «copiado de otro componente» de «supuesto».
8. Idioma del contenido: el del proyecto (por defecto, español). Los nombres de props, ids y tokens, tal cual.

## Elige el modo

| La persona dice… | Modo |
| --- | --- |
| «Contrato de este componente» + enlace de Figma | **A. Figma → contrato** |
| «Contrato de un componente nuevo» + mini-spec o descripción | **B. Spec → contrato** |
| «Crea/dibuja el componente en Figma desde el contrato» | **C. Contrato → Figma** |
| «¿Coincide Figma con el contrato?» / «Actualiza el contrato» | **D. Comparar y sincronizar** |

### A. Figma → contrato

1. Extrae `fileKey` y `nodeId` del enlace (`node-id=1129-78567` → `1129:78567`). Ver `references/figma-reading.md`.
2. Lee, por este orden: tipo y propiedades del component set → una variante de ejemplo (árbol de capas) → tokens por variante, estado y tamaño → medidas.
3. Copia la plantilla y rellena con `references/contract-format.md`. Si es parecido a uno existente, ábrelo antes y reutiliza su estructura (`assets/example.*`).
4. Valores por defecto de Figma marcados con ✦: usa el valor sin marca.
5. Sigue con **Al terminar**.

### B. Spec → contrato (componente nuevo)

1. Pide la mini-spec (`references/mini-spec.md`). Si falta, no la inventes: pide como mínimo propósito, contenido obligatorio, responsive y la acción principal.
2. Reutiliza componentes que ya tengan contrato (`composition.nestedComponents`, `slot.allowedComponents`). Si dependes de uno que no existe, díselo.
3. Si es compuesto (Navbar, Tabs, Table…), lee `references/composite-components.md`.
4. Deja `anchors.figma.node` en `—` y `bindings.figma` en `null` hasta que exista en Figma. `status: draft`.
5. Todo lo que decidas por tu cuenta va a `meta.needsReview` como «decisión propuesta: …», y la sección «Decisiones abiertas» de la spec se devuelve como preguntas.
6. Sigue con **Al terminar**.

### C. Contrato → Figma

Lee `references/contract-to-figma.md` y el skill `figma-use` (obligatorio antes de escribir en Figma). Antes de crear, comprueba que el archivo de destino tiene las variables y los componentes que el contrato cita; si no, para y dilo. Revisa al final que todo esté enlazado a variables.

### D. Comparar y sincronizar

Lee Figma como en A, compara con el contrato y lista: (1) propiedades de Figma que faltan, (2) props sin propiedad en Figma, (3) capas que no están en `anatomy`, (4) valores sin variable, (5) tokens distintos. No cambies nada hasta que elijan cuál manda. Al aplicar, sube `version` (patch: texto; minor: prop o estado nuevo; major: renombrar o quitar).

## Al terminar

1. **Valida:** `node <ruta-skill>/scripts/check.mjs <raíz>`; debe dar 0 errores. Corrige y repite. Añade una prueba negativa rápida (un token falso) si el contrato tiene tokens nuevos.
2. **Arregla los dependientes:** `guidance.related` de otros contratos, `composition.nestedComponents`, `docs/components.md`, README y el orden de componentes en los prompts. Si algún aviso de «related sin contrato» desaparece, bien.
3. **Entrega:** el contrato (y los archivos dependientes cambiados). Resume en 5–8 líneas: qué se leyó de Figma, qué decisiones tomaste, qué hay que revisar a mano (`needsReview`), y si cambiaste algo fuera del contrato.

## Referencias (léelas solo cuando toque)

- `references/contract-format.md` — bloques, qué va en cada uno, nombres, convenciones de enlace Figma ↔ código y de tokens. **Siempre al escribir un contrato.**
- `references/figma-reading.md` — cómo leer un componente con `use_figma`, snippets, y las rarezas de Figma que ya conocemos.
- `references/composite-components.md` — componentes compuestos (slots, subcomponentes, responsive).
- `references/mini-spec.md` — plantilla para pedir/rellenar la spec.
- `references/contract-to-figma.md` — generar el componente en Figma desde el contrato.
- `references/project-setup.md` — instalar la skill en otro proyecto o en un proyecto Next.js.
- `assets/example.Link.contract.json` (simple), `assets/example.IconButton.contract.json` (matriz variant × color × estado con `tokens.scales`).
