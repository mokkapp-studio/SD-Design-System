# Tokens desde Figma (Radix Themes)

`tokens/tokens.json` es la **única fuente de tokens** del repo: contiene todas las variables y estilos del archivo de Figma *Radix Themes (Community)*, con sus modos. Es lo que leen los contratos, los scripts y los agentes.

```
Figma (variables + estilos)  →  tokens/tokens.json  →  scripts/build-tokens.mjs  →  tokens/tokens.css
        origen                fuente de verdad       (npm run tokens:build)        lo que importa Next.js
```

`tokens.css` se genera siempre desde `tokens.json`: no se edita a mano.

## Qué contiene

Un solo archivo con estos grupos de primer nivel:

| Grupos | Origen en Figma | Modos | Cantidad |
| --- | --- | --- | --- |
| `variables`, `colors` (escalas), `overlays` | Colección «Color scheme» (primitivos: escalas 1–12, alpha, overlays) | **Light** y **Dark** | 798 |
| `colors` (accent, neutral…), `typography`, `spacing`, `radius`, `panel`, `tokens` | Colección «Theme ✦» (semántica) | 1 (`Theme A`) | 226 |
| `radius-scale`, `scaling` | Colecciones «Radius» y «Scaling» (`scaling.90…110.*`) | 1 | 105 |
| `shadows` | Estilos de efecto | n/a | 12 |
| `text-style` | Estilos de texto (`text-style.1.regular`…) | n/a | 36 |

El CSS generado (`tokens.css`) trae 1141 variables en Light y redefine 748 en Dark.

## Cómo se representan los modos

- `$value` es el valor del modo **Light**. `$extensions.modes` guarda `{ light, dark }` en los primitivos de color.
- Los alias se escriben como `{ruta.del.token}`. Los componentes usan la capa **Theme**, que apunta a primitivos; así, cambiar de modo cambia los primitivos y todo lo demás sigue.
- En CSS: Light es el valor por defecto (`:root, [data-theme="light"]`) y Dark solo redefine lo que cambia (`[data-theme="dark"], .dark`): 748 de 798 colores.
- `$extensions["com.figma"].scopes` conserva dónde permite Figma aplicar cada variable (`GAP`, `WIDTH_HEIGHT`…).

## Nombres

Ruta de Figma → minúsculas, espacios a guion, `%` fuera. `Colors/Accent/accent 9` pasa a `colors.accent.accent-9` y a `--colors-accent-accent-9` en CSS. `Radius` y `Scaling` llevan prefijo (`radius-scale`, `scaling`) para no chocar con `radius.*` del theme.

## Sombras y estilos de texto

- Sombras: lista de capas `{color, offsetX, offsetY, blur, spread, inset}` en **orden CSS**. Figma las guarda en el orden inverso y el export lo corrige.
- Texto: cada estilo referencia las variables `typography.*` del theme. En CSS salen como `--text-style-1-regular: 300 12px/16px SF Pro` y `…-letter-spacing`.

## Cómo volver a exportar

1. En Figma, lee las variables con el Plugin API (`figma.variables.getLocalVariableCollectionsAsync()`) y los estilos con `getLocalTextStylesAsync()`, `getLocalEffectStylesAsync()`.
2. Guarda cada variable con su valor por modo y, si es alias, el nombre de la variable destino.
3. Reaplica las reglas de nombres de arriba y reescribe `tokens/tokens.json` (todo en un solo archivo, con los grupos de la tabla de arriba).
4. `npm run tokens:build` y `npm run check`.

Lo importante: el **JSON es lo que se versiona**; el CSS siempre se regenera.

## Añadir temas

El theme (`Theme ✦`) está pensado para tener más modos. Añade un modo en Figma (p. ej. «Theme B») y exporta: ese valor irá en `$extensions.modes` del token del theme y el build emitirá un bloque `[data-theme="b"]`. Hoy el build solo trata light/dark.

## Cosas a revisar

- **Peso Light = 300** es una suposición: Figma lo guarda como texto «Light». Está marcado en el token.
- **`scaling.95.9`** se llama `95%/09` en Figma (errata); aquí es `9`.
- **`text-style.9.light`** usa en Figma `letter-spacing/4` en vez de `/9`. Se respeta tal cual; confírmalo.
- **Gradientes y estilos de imagen** (paint styles) no se exportaron.
- **Radix no separa primitivos de semánticos:** los componentes usan escalas (`colors.neutral.neutral-alpha.3`) directamente. Por eso la `policy` del contrato AlertDialog permite `colors` y `overlays` (escalas) además de `panel`.

## Relación con los contratos

Los `tokens.bindings` de cada contrato usan estas rutas (`colors.accent.accent-9`, `spacing.4`, `shadows.shadow-6`). `npm run check` comprueba que existan y que respeten la `policy`.
