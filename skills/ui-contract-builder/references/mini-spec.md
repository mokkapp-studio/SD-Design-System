# Mini-spec de componente

Se usa en el modo B (componente nuevo). Rellénala la persona; Claude no decide por ella. Todo lo que falte va a «Decisiones abiertas».

```markdown
# Mini-spec: <NombreComponente>

## 1. Propósito
Una frase: qué problema resuelve y para quién.

## 2. Cuándo usarlo / cuándo no
- Úsalo cuando:
- No lo uses cuando (y qué usar en su lugar):

## 3. Contenido
- Obligatorio:
- Opcional:
- Componentes del sistema que reutiliza:

## 4. Variantes y tamaños
Qué cambia visualmente y por qué. Solo lo necesario.

## 5. Estados
Hover, foco, activo, deshabilitado, cargando, seleccionado, vacío, error… Marca cuáles aplican.

## 6. Comportamiento
- Interacción principal:
- Teclado:
- Animación o transición (si hay):

## 7. Responsive
Qué cambia, a qué ancho y cómo (colapsa, apila, oculta, scroll).

## 8. Accesibilidad
- Elemento/rol semántico:
- Nombre accesible:
- Orden de tabulación:

## 9. Contenido y textos
Límites de longitud, tono, textos largos.

## 10. Decisiones abiertas
Lo que aún no sabes.
```

## Cómo se convierte en contrato

| Sección | Bloque del contrato |
| --- | --- |
| 1 Propósito | `description` |
| 2 Cuándo usar | `guidance.dos`, `guidance.donts`, `guidance.related` |
| 3 Contenido | `anatomy`, `composition`, `props` (slots y children) |
| 4 Variantes y tamaños | `props` (`variant`, `size`…), `tokens.bindings.byVariant/bySize` |
| 5 Estados | `states.native` / `states.controlled` |
| 6 Comportamiento | `events`, `behavior`, `a11y.keyboard` |
| 7 Responsive | `behavior.responsive` |
| 8 Accesibilidad | `semantics`, `a11y` |
| 9 Textos | `content` |
| 10 Abiertas | `meta.needsReview` (como preguntas, no como decisiones) |

Los tokens de un componente nuevo no salen de la spec: o los eliges de los existentes (`tokens/`) con la persona, o los dejas como `needsReview` hasta que exista el diseño.

Si faltan 1, 3, 7 o la acción principal, pide esas respuestas antes de escribir el contrato.
