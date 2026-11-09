# Leer Figma para la Spec

Solo lectura salvo los scripts `draw-*`. Antes de leer, confirma archivo (nombre y clave) con la persona.

- La salida de `use_figma` / `figma_execute` se corta hacia 20 KB. `extract-variables.js` mide **una variante** (`VARIANT` filtra por nombre); para otra, vuelve a ejecutarlo con otro texto.
- Pega el script con los parámetros ya editados; no lo partas: usa `return` y `await` en el nivel superior.
- Variables: se resuelven por id y siguen los alias hasta el valor final del primer modo de cada colección (`token` → `via` → `value`). `token: null` = valor sin variable.
- `fills: []` en la raíz del set es normal: el color suele estar en una capa hija.
- Instancias (iconos) no se recorren; mide su capa contenedora.
- Estilos de texto y de efecto se leen por nombre (`text.style`, `effectStyle`).
- Un valor por defecto de Figma puede llevar ✦ en el nombre; el contrato guarda el valor sin marca.
- `--compare` casa tokens de Figma con los del contrato: un placeholder `{…}` casa con cualquier tramo, así que puede dejar pasar un token equivocado. Con duda, mira la capa.
