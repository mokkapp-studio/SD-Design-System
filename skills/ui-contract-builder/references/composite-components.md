# Componentes compuestos (Navbar, Tabs, Table, Menu…)

Un componente compuesto se hace con otros componentes del sistema. Regla: **un contrato por componente que se use por su cuenta**; las piezas internas que solo existen dentro de él se describen en su contrato.

## Cuándo es un contrato y cuándo varios

| Situación | Qué hacer |
| --- | --- |
| La pieza se usa también fuera (Button, IconButton, Link) | Contrato propio. El compuesto la cita en `composition.nestedComponents` o `slot.allowedComponents` |
| La pieza solo existe dentro (NavbarItem, TabsTrigger) | Parte en `anatomy` del compuesto; si tiene props propias, `composition.codeParts` |
| Varias piezas con API compuesta en código (Root, List, Item…) | Un solo contrato; `composition.codeParts` describe cada parte |

## Pasos

1. **Inventario de dependencias.** Lista los componentes que necesita y comprueba cuáles tienen contrato (`contracts/`). Para los que faltan, avisa antes de seguir: propón crearlos primero o dejarlos como `slot.allowedComponents` abierto.
2. **Slots.** Cada zona libre es un slot en `anatomy.<zona>.slot` con `allowedComponents`, `minItems`, `maxItems`, `mandatory`. Ejemplo (Navbar): `brand` (1, obligatorio), `nav` (1–7 Link), `actions` (0–3 Button/IconButton).
3. **Reglas de composición.** `composition.allowedChildren` / `forbiddenChildren`: qué cabe y qué nunca (p. ej. un Navbar no contiene otro Navbar; el slot `actions` no admite más de un Button con variante solid/classic).
4. **Responsive.** En `behavior.responsive`: lista de `{ breakpoint, change }`. Cada cambio debe ser concreto: «por debajo de 768 px `nav` pasa a un menú desplegable abierto por un IconButton con aria-label “Abrir menú”». Los breakpoints deben existir como token si el sistema los define; si no, valor suelto + `needsReview`.
5. **Estados propios.** Abierto/cerrado, seleccionado, activo. Los que persisten son `states.controlled` con su `aria` (`aria-expanded`, `aria-current="page"`).
6. **Teclado y foco.** Un compuesto casi siempre necesita `a11y.keyboard` extenso (flechas, Escape, Tab) y orden de foco. No lo dejes en blanco.
7. **Semántica.** `semantics.element` del contenedor (`nav`, `ul`…) y `a11y.name` (landmark con `aria-label`).
8. **Tokens.** Solo los propios del contenedor (fondo, borde, espacios, alturas). Los de las piezas internas ya están en sus contratos: no los dupliques.
9. **Layout.** Alto, anchos máximos, auto layout del contenedor, y cómo se reparte el espacio entre slots (`gap` por tamaño).
10. **Dependencias en doble sentido.** Añade el compuesto a `guidance.related` de las piezas (relación `contained-by`) y las piezas al suyo (`contains`).

## Ejemplo de esqueleto (Navbar)

```json
"anatomy": {
  "root":    { "element": "header", "description": "Contenedor de la barra." },
  "brand":   { "element": "slot", "slot": { "key": "brand", "allowedComponents": ["Link"], "minItems": 1, "maxItems": 1, "mandatory": true } },
  "nav":     { "element": "slot", "slot": { "key": "nav", "allowedComponents": ["Link"], "minItems": 1, "maxItems": 7, "mandatory": true } },
  "actions": { "element": "slot", "optional": true, "slot": { "key": "actions", "allowedComponents": ["Button", "IconButton"], "minItems": 0, "maxItems": 3, "mandatory": false } },
  "menuToggle": { "element": "slot", "description": "Solo en móvil.", "slot": { "key": "menuToggle", "allowedComponents": ["IconButton"], "minItems": 1, "maxItems": 1, "mandatory": false } }
}
```

Es un esqueleto de forma, no un diseño: cada decisión (cuántos enlaces, qué colapsa) viene de la mini-spec.
