---
name: contract-to-component
description: Implementa un componente React + TypeScript (tsx y CSS Module) a partir de su contrato JSON de sistema de diseño y verifica que el código cumple el contrato. Úsala cuando pidan "crea el componente <X> desde su contrato", "implementa el contrato de <X> en tsx", "comprueba que <X> cumple el contrato" o "actualiza el componente tras cambiar el contrato".
---

# contract-to-component

Convierte `contracts/<Nombre>.contract.json` en código y **demuestra** que lo cumple. El contrato manda: si el código y el contrato discrepan, el error está en el código, o hay que cambiar primero el contrato.

La skill hermana `ui-contract-builder` crea los contratos. Esta solo los consume; no modifica el sistema de diseño.

## Qué garantiza y qué no

- **Garantiza (se comprueba con script):** mismas props, tipos y defaults; mismas partes (`data-part`); mismos estados y atributos ARIA; **solo** los tokens del contrato, ni colores ni medidas sueltas, sin opacity en disabled; copia del contrato idéntica al original.
- **No garantiza:** que el render sea pixel a pixel como Figma (fuentes, geometría del anillo de foco, degradados sin variable, spinner). Eso se revisa con `references/parity.md`.

## Paso 0 — Localizar

1. **Contrato:** `<sistema>/contracts/<Nombre>.contract.json` (el sistema suele estar en `design-system/`). Si no existe, **para y pregunta**; no lo inventes (puedes proponer usar `ui-contract-builder`).
2. **Reglas del proyecto:** lee `AGENTS.md` del proyecto (`AGENTS.nextjs.md` es su plantilla). Manda sobre los valores por defecto de abajo.
3. **Stack:** `package.json` (React 18 o 19, `radix-ui`, `lucide-react`), alias `@/`, dónde está `components/`, si `tokens.css` está importado en `globals.css`.
4. **Valores por defecto** si el proyecto no dice otra cosa: Next.js App Router, TypeScript estricto, CSS Modules, estados con atributos `data-*`, carpeta `src/components/<id>/`.

## Reglas que no se negocian

1. **Props exactamente como el contrato.** Nombre, tipo, default y obligatoriedad. No añadas ni quites. Props solo de código (`bindings.figma: null`) también se implementan.
2. **Valores solo de `tokens.bindings`.** Variables CSS con la regla `colors.accent.accent.9` → `var(--colors-accent-accent-9)`. Ni hex, ni px sueltos (salvo los números del contrato: `layout`, anchos de borde), ni `style={{}}`.
3. **Disabled nunca con opacity.** Opacity solo con los valores numéricos del contrato (hover/active).
4. **Partes y ref:** cada clave de `anatomy` (salvo `element: "css"`) lleva `data-part="<clave>"`. El `ref` va en `semantics.refTarget`.
5. **Estados:** los `native` con CSS (`:hover`, `:focus-visible`, `:active`); los `controlled` son props con su atributo ARIA/HTML.
6. **`meta.needsReview` no se rellena con suposiciones.** Lo que afecte al código: pregunta, o impleméntalo marcado con `TODO(contract): <motivo>` y cuéntalo en el resumen.
7. **Dependencias:** reutiliza los componentes que pida `composition.nestedComponents` o `slot.allowedComponents` y que ya existan. Si no existe alguno, **para y lista lo que falta**; no lo recrees dentro.
8. **Contrato primero.** Si algo del contrato es imposible, contradictorio o está mal, no lo corrijas en el código: propón el cambio de contrato (con la versión que sube) y espera.
9. **No toques el sistema de diseño** (`design-system/`), ni `tokens.css`. No instales librerías sin preguntar.
10. **Comportamiento accesible complejo** (Checkbox, RadioGroup, Switch, AlertDialog…): primitivos de `radix-ui` + nuestros estilos con `data-*`. No reimplementes foco ni teclado.

## Procedimiento

1. **Leer** el contrato entero, `docs/components.md` (vocabulario) y `meta.needsReview`. Apunta cuáles afectan al código.
2. **Comprobar dependencias** (regla 7). Si faltan, parar.
3. **Plan corto** (solo si lo piden, o si el componente tiene comportamiento complejo o Radix): props, partes→elementos, qué primitivo, qué `needsReview` te afecta, dudas. Espera el visto bueno.
4. **Crear la carpeta** `src/components/<id>/` con:
   - `<id>.contract.json`: copia exacta (`cp`), sin tocar.
   - `<id>.module.css`: ver paso 5.
   - `<id>.tsx`: empieza con `/** @contract <Nombre>@<versión> */`; `export function <Nombre>` y `export interface <Nombre>Props`; `"use client"` solo si hay estado, eventos propios o hooks. Mira `references/implementation-map.md` y `assets/example/icon-button/` (componente real que pasa el verificador).
5. **CSS de tokens:**
   - Si el contrato tiene `byVariant`, `bySize`, `byHighContrast` o `byState`: **genera** el bloque, no lo escribas a mano:
     `node <skill>/scripts/gen-css.mjs <contrato> --ds <sistema> --write src/components/<id>/<id>.module.css`
     Escribe entre `/* @generated:start */` y `/* @generated:end */`; lo demás del archivo es tuyo. Si el script avisa de «claves sin traducir», esas las escribes tú desde el contrato (ver implementation-map).
   - Escribe a mano solo lo que el contrato no tiene como token: reinicio del elemento, tamaño del icono (`layout.iconSize`), foco, carga.
6. **Verificar:** `node <skill>/scripts/conformance.mjs src/components/<id> --ds <sistema>`. Debe dar **0 errores**. Si falla, arregla el código (regla 8 si es el contrato). Repite.
7. **Verificar el proyecto:** `tsc --noEmit` (o `npm run build`), `npm run lint`. Añade el componente al playground con todas sus variantes, tamaños y estados.
8. **Paridad con Figma:** si lo piden, o si el componente es crítico, `references/parity.md`.
9. **Resumen** (corto): archivos creados; reglas del contrato aplicadas; puntos de `needsReview` / `TODO(contract)` que quedan; resultado del verificador; cómo probarlo (ruta del playground).

## Actualizar un componente cuando cambia el contrato

1. Compara la versión de `@contract` del tsx con la del contrato.
2. Vuelve a copiar el contrato, regenera el bloque con `gen-css`, ajusta el tsx (props nuevas, partes, estados), sube el comentario `@contract`.
3. Ejecuta el verificador; cualquier error es una diferencia real entre código y contrato.

## Referencias

- `references/implementation-map.md` — de cada bloque del contrato a su código (con patrones de tsx y CSS, Radix, React 18/19).
- `references/parity.md` — qué significa «idéntico a Figma», cómo comprobarlo y qué queda fuera.
- `assets/example/icon-button/` — IconButton completo: contrato, tsx, CSS con bloque generado.
- `scripts/gen-css.mjs`, `scripts/conformance.mjs`, `scripts/lib.mjs` — Node 18+, sin dependencias.
