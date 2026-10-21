# Prompts para trabajar en Next.js

Plantillas para pedirle al agente (Claude Code) que construya componentes y páginas desde los contratos. Sustituye lo que va entre `<…>`.

Reglas generales:
- **Una tarea por sesión** (un componente, una página). Sesiones cortas rinden más.
- **Plan primero, código después** para componentes nuevos: pide el plan, léelo, y entonces di «adelante».
- **Rutas explícitas**: nombra siempre el contrato y la carpeta.
- **Un componente por commit.**

---

## 0. Preparar el proyecto (una vez)

```
Lee AGENTS.md. Prepara el proyecto Next.js para usar el sistema de diseño de design-system/:

1. En src/app/globals.css importa design-system/tokens/tokens.css al principio.
2. En src/app/layout.tsx añade data-theme="light" al <html>.
3. Añade a package.json los scripts:
   "ds:check": "node design-system/check.mjs"
   "ds:tokens": "node design-system/scripts/build-tokens.mjs"
4. Crea src/components/ y src/app/playground/page.tsx (una página vacía con el título «Playground»).
5. Comprueba que `npm run dev` arranca y que `npm run ds:check` pasa.

No crees ningún componente todavía. Resume lo que has cambiado.
```

## 1. Crear un componente (con plan previo)

**Paso A: plan**

```
Lee AGENTS.md y design-system/contracts/<Componente>.contract.json.
Todavía no escribas código. Dame un plan en esta forma:

- Props del componente (tabla: nombre, tipo, default).
- Partes de la anatomía y qué elemento HTML usa cada una.
- Cómo implementarás el comportamiento (¿primitivo de Radix o código propio?, ¿necesita "use client"?).
- Qué tokens usarás y cómo se convierten en variables CSS.
- Qué parte de meta.needsReview te afecta y qué harás con ella.
- Dudas o decisiones que necesites de mí.
```

**Paso B: construir**

```
Adelante con el plan, con estos ajustes: <ajustes o «ninguno»>.

1. Crea src/components/<nombre>/ con <nombre>.tsx y <nombre>.module.css.
2. Copia el contrato a src/components/<nombre>/<nombre>.contract.json (sin modificarlo).
3. Añade el componente al playground con todas sus variantes, tamaños y estados.
4. Ejecuta `npm run build` y `npm run lint`. Corrige lo que falle.

Termina con el resumen de AGENTS.md.
```

## 1b. Crear un componente con la skill

```
Con contract-to-component, crea el componente <Componente> desde design-system/contracts/<Componente>.contract.json.
Sigue AGENTS.md. Si faltan dependencias o hay puntos de meta.needsReview que afecten al código, pregúntame antes.
Termina con el resultado del verificador y el resumen de AGENTS.md.
```

## 2. Revisar un componente contra su contrato (solo lectura)

```
Revisa src/components/<nombre>/ contra design-system/contracts/<Componente>.contract.json.
No cambies nada. Lista, en tablas separadas:

- Props que faltan, sobran o no coinciden en tipo o default.
- Partes de anatomy sin data-part, y refTarget.
- Tokens del contrato que no se usan y valores del CSS que no salen del contrato (hex, px sueltos).
- Estados (native y controlled) no implementados y atributos ARIA que faltan.
- Incumplimientos de a11y (teclado, foco, área mínima, nombre accesible).
Marca cada hallazgo como error o aviso.
```

## 3. Generar la documentación

```
Lee src/components/<nombre>/<nombre>.contract.json y genera src/components/<nombre>/<nombre>.md con:
descripción, do's y don'ts, tabla de props, estados, anatomía (con slots), tokens y accesibilidad,
y un ejemplo de uso en TSX.
No inventes nada que no esté en el contrato. Incluye los puntos de meta.needsReview como «Pendiente».
```

## 4. Componente compuesto (RadioGroup, AlertDialog…)

```
Lee AGENTS.md y design-system/contracts/<Componente>.contract.json.
El contrato es de un componente compuesto: mira composition.codeParts y composition.item.
Antes de escribir código dime:
- Qué partes exportarás (por ejemplo <Componente>.Root y <Componente>.Item).
- Qué componentes que ya existen en src/components/ reutilizarás.
- Si falta algún componente que el contrato necesita (slot.allowedComponents) y no existe.
Si falta alguno, pregúntame antes de seguir.
```

## 5. Crear una página o formulario

```
Crea la página src/app/<ruta>/page.tsx: <descripción: p. ej. formulario de acceso con correo, contraseña, «recordarme» y botón de enviar>.

Reglas:
- Usa solo componentes de src/components/. Si necesitas uno que no existe, no lo crees: dime cuál falta.
- Layout con CSS Module propio (page.module.css) y tokens (var(--spacing-*)). Sin valores sueltos.
- Cada campo con su label; el formulario con aria-label o título.
- Server Component por defecto; "use client" solo en el formulario si tiene estado.
Termina con la lista de componentes usados y los que faltan.
```

## 6. Cambió el contrato

```
design-system/contracts/<Componente>.contract.json ha cambiado (versión <x.y.z>).
1. Vuelve a copiarlo a src/components/<nombre>/<nombre>.contract.json.
2. Compara el contrato nuevo con el código actual y dime qué hay que cambiar. No cambies código todavía.
3. Cuando te lo confirme, aplícalo, regenera <nombre>.md y actualiza el playground.
```

## 7. Cambiaron los tokens

```
He actualizado design-system/ (tokens). Ejecuta `npm run ds:check`.
Busca en src/components/ cualquier token que ya no exista (variables --… que no estén en tokens.css) y dime qué componentes se rompen. No cambies nada hasta que te lo confirme.
```

## 8. Cuando el agente se desvía

| Síntoma | Qué decirle |
| --- | --- |
| Inventa una prop o variante | «Esa prop no está en el contrato. Quítala o pregúntame.» |
| Usa un color o px suelto | «Sustituye ese valor por el token del contrato (`tokens.bindings…`).» |
| Reimplementa el teclado a mano | «Usa el primitivo de Radix para el comportamiento (AGENTS.md).» |
| Opacity en disabled | «Disabled usa `byState.disabled`, nunca opacity.» |
| Crea un componente sin contrato | «No hay contrato. Para y dime qué falta.» |

## 9. Iconos

**Instalar (una vez):**

```
Lee AGENTS.md y design-system/docs/icons.md. Instala los iconos de Lucide:
1. npm install lucide-react
2. Añade a package.json el script "ds:icons": "node design-system/scripts/build-icons.mjs src/components/icon/icons.ts" y ejecútalo.
3. Crea src/components/icon/ con icon.tsx y icon.module.css desde design-system/contracts/Icon.contract.json, y copia el contrato.
4. Añade al playground una fila con todos los iconos de design-system/icons/registry.json a los tamaños 14, 16, 18 y 20.
No modifiques otros componentes todavía. Resume lo que has hecho.
```

**Conectar un componente con iconos:**

```
Lee design-system/contracts/<Componente>.contract.json y src/components/icon/.
El componente tiene slots de icono (<icon, iconEnd…>). Haz que:
- el tamaño del icono salga de layout.iconSize del contrato, por CSS según size;
- el color se herede (currentColor);
- el playground muestre el componente con y sin icono.
No importes iconos dentro del componente: los recibe como nodo.
```

**Añadir un icono:**

```
Necesito el icono «<descripción>». Búscalo en lucide.dev/icons, dime el nombre PascalCase y propón la entrada para design-system/icons/registry.json (name y use). No toques design-system/: dame solo la entrada.
```

## 10. Orden recomendado de componentes

1. Icon (tras instalar Lucide).
2. Button y Link (Button usa Icon; Link no tiene dependencias).
3. IconButton (mismos tokens que Button; recibe un Icon; exige `aria-label`).
4. Checkbox, Switch, RadioGroup (comportamiento con primitivos).
5. TextField (usa IconButton como botón final: hazlo después de IconButton).
6. AlertDialog (usa Button).
7. Páginas: acceso, ajustes, formulario largo.
