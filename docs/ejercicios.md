# Ejercicios — Sección 2

Cada ejercicio produce algo que se queda en el repo. Hazlos en orden.

## Ejercicio 1 — Leer un contrato (20 min)

Abre `contracts/Button.contract.json` junto a un botón de tu Figma.
- Marca con colores qué campos puedes deducir mirando Figma y cuáles no.
- Lista 3 `donts` que añadirías a `guidance`.
- Abre `TextField.contract.json` y localiza sus slots: ¿qué diferencia hay con un icono de Button?
- **Entregable:** una nota con los campos «no están en Figma» (esperados: `description`, `guidance`, `a11y`, `events`).

## Ejercicio 2 — Preparar tu componente en Figma (45 min)

Elige **un** componente simple de tu sistema (botón, badge, input).
- Variables con nombre por uso, no por aspecto.
- Auto layout, propiedades y capas con nombre estable.
- Descripción del componente.
- **Entregable:** captura del panel de propiedades y de la lista de variables que usa.

## Ejercicio 3 — Tokens (30 min)

Busca en `tokens/tokens.json` las variables que usa ese componente y anótalas. Si trabajas con tu propio Figma, añade o sustituye las tuyas siguiendo `docs/tokens-from-figma.md`.
- **Entregable:** la lista de rutas de token del componente (por ejemplo `colors.accent.accent.9`) y, si usas tu Figma, tu `tokens.json` con valores reales.

## Ejercicio 4 — Tu primer contrato, a mano (60 min)

Copia `_template.contract.json` y rellénalo con `docs/contract-guide.md`; borra los bloques opcionales que no apliquen.
- Ejecuta `node check.mjs` hasta que no haya errores.
- **Entregable:** `contracts/<Componente>.contract.json` sin placeholders `<...>` (salvo anchors), con `check` en verde.

## Ejercicio 5 — Del contrato al código (60 min)

En un proyecto Next.js vacío, sigue `docs/nextjs.md`: tokens → CSS, contrato → componente, en modo plan.
- **Entregable:** `components/<nombre>/` con `.tsx`, `.module.css` y el contrato copiado, más la lista de reglas que el agente dice haber aplicado.

## Ejercicio 6 — Auditoría y documentación (45 min)

Pide al agente: «Compara el componente con su contrato y lista incumplimientos». Verifica a mano 2 de ellos. Después pide `<componente>.md` generado desde el contrato (prompt en `docs/contract-guide.md`, sección 8).
- **Entregable:** lista de incumplimientos, qué corriges (¿el código o el contrato?) y el `.md` junto al componente.

## Ejercicio 7 — Un contenedor con slots (60 min)

Repite 2–4 con un componente con huecos (Panel, Modal, Navbar). Modela cada hueco como `slot` con `allowedComponents`, `minItems`, `maxItems` y `figmaProp`.
- **Entregable:** contrato con slots y comparación contra Figma (`docs/figma.md`, sección 5).

## Después

Repite con un componente de formulario y uno de capa (bloques `form` y `overlay`). Cuando el trabajo manual se repita, ya estás listo para la skill que lo automatiza.
