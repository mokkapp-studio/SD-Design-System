# Leer un componente de Figma

Herramienta: `use_figma` del MCP de Figma, **solo lectura**. Antes de la primera llamada, carga el skill `figma-use` (obligatorio). Parámetros típicos: `fileKey`, `description`, `skillNames: "resource:figma-use"`, `code`.

URL → ids: `figma.com/design/<fileKey>/...?node-id=1129-78567` → `fileKey` y `nodeId = 1129:78567` (el guion pasa a dos puntos). En una URL con `/branch/<branchKey>/` usa `branchKey` como `fileKey`.

## Límites

- La salida se corta a ~48 KB: lee por trozos (un tamaño, un estado, un color) y devuelve cadenas compactas, no objetos.
- No hagas bucles sobre las 700+ variantes con salida completa. Filtra por un tamaño y deduce el resto; anota en `needsReview` lo que solo leíste en un tamaño.
- Escribe el código a prueba de nulos: `find(...)` puede devolver `undefined` en variantes que ocultan capas.

## Lectura 1 — estructura y propiedades

```js
const n = await figma.getNodeByIdAsync('NODE_ID');
const out = { name: n.name, type: n.type };
if (n.type === 'COMPONENT_SET') {
  out.defs = Object.fromEntries(Object.entries(n.componentPropertyDefinitions)
    .map(([k, v]) => [k, { t: v.type, d: v.defaultValue, o: v.variantOptions }]));
  out.count = n.children.length;
  const tree = (x, d = 0) => ({ n: x.name, t: x.type, v: x.visible, w: Math.round(x.width), h: Math.round(x.height),
    txt: x.type === 'TEXT' ? x.characters : undefined,
    c: 'children' in x && d < 4 ? x.children.map(k => tree(k, d + 1)) : undefined });
  out.tree = tree(n.children[0]);
}
return JSON.stringify(out);
```

De aquí salen: `props` (con `bindings.figma`), el número de variantes, `anatomy` (capas) y qué capas se activan con BOOLEAN (`figmaToggle`).

## Lectura 2 — tokens por variante

Resuelve variables por id, con caché, y usa nombres cortos para que quepa.

```js
const cache = {};
const vn = async (id) => { if (!id) return null;
  if (!cache[id]) { const v = await figma.variables.getVariableByIdAsync(id); cache[id] = v ? v.name : id; }
  return cache[id]; };
const paint = async (arr) => { if (!arr || !arr.length) return '-'; const o = [];
  for (const p of arr) { const b = p.boundVariables && p.boundVariables.color;
    o.push(b ? await vn(b.id) : p.type === 'SOLID' ? '#raw' : p.type); } return o.join('>'); };
```

Por cada variante: `fills`, `strokes`, `strokeWeight`, `effectStyleId` (estilo de sombra), `opacity`, radio (`boundVariables.topLeftRadius`), `textStyleId`. Un valor `#raw` o sin variable = no enlazado → `needsReview`.

Texto: `textStyleId` → `(await figma.getStyleByIdAsync(id)).name` (p. ej. `Typography/3/Regular` → `text-style.3.regular`).

## Rarezas conocidas (compruébalas siempre)

- **Dónde está el color.** A menudo el nodo raíz tiene un relleno vacío «crudo» y el color real está en un hijo (`content-container`). Lee el hijo, no solo la raíz.
- **Instancias opacas.** Iconos y otras instancias no dejan leer sus rellenos internos en algunas variantes. Confirma solo los casos legibles y marca el resto como supuesto.
- **✦ en los valores por defecto** (`solid ✦`, `2 ✦`, `default ✦`): el nombre real es sin marca. Y el default del component set puede no ser el ✦ (`defaultVariant`).
- **Erratas de nombre** (`highConstrast`): `bindings.figma.property` va como está en Figma; la prop de código con el nombre correcto. Verifica cada componente, no copies la errata.
- **Variantes que solo existen con un estado** (p. ej. `loading=true` solo con `state=disable`): anótalo en `needsReview`.
- **Opacity de hover/active y degradados** suelen estar fijos, sin variable. No inventes token.
- **Tamaños sin variable** (alto, ancho, tamaño de icono): se anotan como valores y se señala la coincidencia con tokens existentes solo si el valor coincide.
- **Alpha del color enlazado**: `paint.opacity` ya trae el alfa de la variable; no lo trates como opacidad aparte.
- **Estados no diseñados** (hover, foco): `states.native` los lista, pero `needsReview` dice «sin diseño en Figma».
- **Espacio entre iconos y texto, padding**: si no hay variable ligada, no pongas `spacing.N` por intuición; compara el valor con la escala y di que es por coincidencia.

## Qué NO se saca de Figma

`description`, `guidance`, `a11y`, `events`, `testing`, `anchors.code`. Redáctalos tú y marca las decisiones.
