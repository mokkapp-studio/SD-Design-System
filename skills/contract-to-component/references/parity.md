# Paridad diseño ↔ código

«Exactamente iguales» tiene tres niveles. Los dos primeros se comprueban con script; el tercero se revisa.

## Nivel 1 — Contrato ↔ código (automático)

`scripts/conformance.mjs`. Garantiza que el código dice lo mismo que el contrato: props, partes, estados, atributos ARIA, tokens permitidos, ausencia de valores sueltos y de opacity en disabled, copia idéntica del contrato. Se ejecuta siempre.

## Nivel 2 — Tokens ↔ valores finales (automático, opcional)

El contrato fija *qué token va en cada sitio*; `tokens.css` fija su valor. Si ambos son los de Figma, los valores coinciden. Para comprobarlo en el navegador, con el playground abierto:

1. Para cada combinación (variante × color × tamaño × estado) lee `getComputedStyle` del elemento (`background-color`, `color`, `border-color`, `box-shadow`, `height`, `border-radius`).
2. Compara con el valor que resulta de resolver el token del contrato en `tokens.css` (modo claro y oscuro).
3. Las diferencias son bugs de CSS (especificidad, orden, propiedad equivocada).

No hay script para esto todavía. Se puede hacer con Playwright; pídelo si lo quieres como `scripts/computed-audit.mjs`.

## Nivel 3 — Render ↔ Figma (revisión visual)

Qué puede diferir aunque el contrato se cumpla, y qué hacer:

| Diferencia posible | Por qué | Qué hacer |
| --- | --- | --- |
| Fuente (SF Pro en Figma, otra en el navegador) | Figma usa la fuente del archivo; el código, `typography.font-family` | Instala la misma fuente o acepta la diferencia y anótala |
| Anillo de foco | La geometría está en `needsReview` | Comparar con Figma y fijar en el contrato |
| Degradados de `classic` | Capas sin variable en Figma | Ver `needsReview`; no se pueden generar desde tokens |
| Opacity de hover/active | Fija en Figma, valores del contrato | Igual; revisar que se aplican |
| Spinner | Sin contrato propio | Usar el componente real cuando exista |
| Anti-aliasing, subpíxeles | Motor de render | Tolerancia de 1 px |

**Procedimiento:**

1. En Figma, `get_screenshot` del nodo `anchors.figma.node` (o de variantes concretas).
2. En el navegador, captura el playground del mismo componente, mismo estado y tamaño.
3. Compara por pares: mismo tamaño en px, mismos colores, mismo radio, mismo peso de texto.
4. Cada diferencia real: ¿es del código (corrígelo), del contrato (cámbialo primero) o de Figma (anótalo en `meta.needsReview`)?

## Cuándo hacer qué

| Situación | Nivel |
| --- | --- |
| Siempre | 1 |
| Componente con muchas variantes (Button, IconButton, Link) o antes de publicar el sistema | 1 y 2 |
| Componente crítico, nuevo en producción o tras cambiar tokens | 1, 2 y 3 |

## Para que la paridad se mantenga

- El contrato es el único sitio donde se cambia la intención: **contrato primero**, versión nueva, luego código.
- La copia del contrato junto al componente y el comentario `@contract` permiten detectar código atrasado: el verificador falla si no coinciden con el original.
- Ejecuta el verificador en CI para todos los componentes:
  `for d in src/components/*/; do node design-system/skills/contract-to-component/scripts/conformance.mjs "$d" --ds design-system || exit 1; done`
