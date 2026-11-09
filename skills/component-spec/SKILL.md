---
name: component-spec
description: Genera la Spec («Documentation») de un componente ya dibujado en Figma a partir de su contrato JSON, y la publica como Spec nativa de Figma. Úsala al terminar de dibujar o cambiar un componente, o cuando pidan «genera/actualiza la Spec de <Componente>». No dibuja el componente.
---

# component-spec

Entrada: `contracts/<Componente>.contract.json` + el componente ya dibujado en Figma. Salida: un documento Spec en la página del componente. La Spec se **genera**; la edición a mano se pierde en la siguiente pasada.

Los **datos** (tablas de props, tokens, medidas) son Markdown, para que los lea una máquina. Solo los **dibujos** (anatomía, cotas) son imagen.

## Antes de empezar

- La **raíz** del sistema es la carpeta con `contracts/component.schema.json` y `check.mjs`. Sin ellas, para y dilo.
- Confirma con la persona el archivo de Figma (nombre y clave) y el nodo del componente antes de leer o escribir. Sin componente dibujado, para: esta skill no lo crea.
- Carga el skill `figma-use` antes de cada `use_figma`.
- No cambies el esquema ni el contenido del contrato. Todo desajuste se informa, nunca se corrige aquí.

## Pasos

Cada paso termina cuando se cumple su criterio; no pases al siguiente antes.

1. **Contrato válido.** `node <raíz>/check.mjs <raíz>` → **0 errores**. Con errores, para y repórtalos.
2. **Datos de Figma.** Ejecuta `scripts/figma/extract-variables.js` (solo lectura; edita `NODE_ID`) y guarda la salida como `figma.json`. Criterio: el JSON trae `layers` y cada color/medida es una variable (`token`) o queda marcada «sin token». Lee `references/figma-reading.md` si la salida se corta o falta una capa.
3. **Avisos de desajuste.** `node scripts/build-spec.mjs <raíz> <Componente> --compare figma.json`. Criterio: cada aviso reportado a la persona con su capa o propiedad. No cambies nada en contrato ni Figma.
4. **Dibujos.** Ejecuta `scripts/figma/draw-anatomy.js` y `scripts/figma/draw-specs.js` (escriben en la página de building blocks; edita sus parámetros con `anatomy.<parte>.figmaLayer`). Exporta cada lámina con `exportAsync` (PNG, 2x). Criterio: una imagen de anatomía con todas las partes numeradas y una de cotas; revisa las dos con una captura.
5. **Markdown.** `node scripts/build-spec.mjs <raíz> <Componente> --figma figma.json > spec.md`. Sustituye `<!-- image:anatomy -->` e `<!-- image:specs -->` por `![alt](data:image/png;base64,…)` y rellena o borra `<!-- contrast: -->` con el contraste medido de la variante dibujada. Criterio: ningún marcador `<!-- … -->` en el texto.
6. **Publicar.** Localiza el SPEC_BLOCK del componente (contrato `meta`/`anchors.figma.spec` o la Section del componente). Si no existe, `figma.spec.createOnCanvasAsync`; si existe, `editContent` sección a sección. Estructura de página y límites de la API en `references/spec-template.md`.
7. **Verificar.** Relee con `getContent`, guarda el texto como `reread.md` y ejecuta `node scripts/build-spec.mjs <raíz> <Componente> --verify reread.md`. Criterio: salida `✓`. Con `✗`, corrige y repite desde el paso 5.

## Al terminar

Informa en 5–8 líneas: versión del contrato publicada, avisos del paso 3 (todos), qué dibujos se hicieron, valores «sin token», y lo que no pudiste comprobar. Declara «verificado» solo lo releído.

## Referencias (léelas cuando toque)

- `references/spec-template.md` — esqueleto de la Spec, de dónde sale cada bloque del contrato, página y Section en Figma.
- `references/figma-reading.md` — leer Figma por trozos, límites de salida, rarezas.
