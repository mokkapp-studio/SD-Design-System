# Contrato → Figma (modo C)

Genera o completa el componente en Figma a partir del contrato. Es el modo más delicado: escribe en el archivo de la persona.

## Antes de empezar

1. Carga el skill `figma-use` (obligatorio antes de `use_figma`) y, para crear una librería, `figma-generate-library`.
2. Confirma con la persona **en qué archivo y en qué página** se crea. No crees en un archivo que no te hayan indicado.
3. Comprueba que ese archivo tiene lo que el contrato cita:
   - las **variables** de `tokens.bindings` (búscalas por nombre; en una librería remota, impórtalas);
   - los **componentes** de `composition.nestedComponents` y `slot.allowedComponents`.
   Si falta algo, **para y dilo**: nunca lo sustituyas por valores sueltos ni por rectángulos.
4. Con `search_design_system` busca componentes y variables existentes y reutilízalos.

## Qué se crea

- Un `COMPONENT_SET` con nombre `name` y propiedades según `props[].bindings.figma` (mismo nombre, tipo y `value`).
- Capas con los nombres de `anatomy[*].figmaLayer`, con auto layout según `layout.autoLayout`.
- Slots e instance swap según `anatomy.<parte>.slot.figmaProp`.
- Cada relleno, borde, sombra, radio y texto **enlazado a la variable** o estilo del contrato. Si el contrato no tiene token para algo, no lo pintes: pregunta.
- Variantes para cada combinación de `props` de tipo VARIANT; ✦ en el valor por defecto si el archivo lo usa.

## Al terminar

1. Lee de vuelta el componente con el modo D (comparar) y lista diferencias contra el contrato.
2. Comprueba que no haya valores sin variable.
3. Actualiza el contrato: `anchors.figma.node` con el nodo nuevo y `meta.needsReview` con lo no resuelto.
4. Pide revisión visual: la composición y el pulido fino los hace la persona.
