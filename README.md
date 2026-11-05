# Mi sistema de diseño (repo mínimo)

Un repositorio pequeño que guarda **la fuente de verdad** de tu sistema de diseño en archivos que entienden tanto las personas como los agentes de IA.

Ejericios para Next.js y Figma

```
Figma (componentes + variables)
        │  lo describes una vez
        ▼
tokens/tokens.json  +  contracts/*.contract.json     ← este repo (la ÚNICA fuente de tokens es tokens.json)
        │  los lee el agente
        ▼
Código (Next.js: button.tsx + CSS + contrato al lado)
```

Figma y código **no se actualizan entre sí**: los dos se comprueban contra el contrato.

## Qué hay dentro

```
mi-sistema-de-diseno/
├── README.md
├── AGENTS.md                       reglas de la IA para este repo del sistema
├── AGENTS.nextjs.md                plantilla de AGENTS.md para el proyecto Next.js
├── check.mjs                       comprobación sin dependencias: node check.mjs
├── .gitignore                      qué no se sube a Git
├── skills/
│   ├── ui-contract-builder/        skill: crea contratos (desde Figma o mini-spec)
│   └── contract-to-component/      skill: implementa el tsx desde el contrato y lo verifica
├── scripts/build-tokens.mjs        genera tokens.css desde el JSON
├── scripts/build-icons.mjs         genera icons.ts desde icons/registry.json
├── scripts/build-icon-catalog.mjs  genera icons/catalog.json desde Lucide
├── scripts/build-figma-icons.mjs   lotes de código para crear los iconos en Figma
├── icons/catalog.json              TODO Lucide: 1.903 iconos con tags y categorías (generado)
├── icons/registry.json             iconos permitidos en código (subconjunto del catálogo)
├── icons/phosphor/                 ALTERNATIVA a Lucide: catalog.json (1.512 iconos), registry.json, icons.ts
├── scripts/build-phosphor-*.mjs    catálogo, icons.ts y lotes de Figma de Phosphor (npm run phosphor:*)
├── package.json                    scripts "check" y "tokens:build"
├── tokens/
│   ├── tokens.json                 FUENTE ÚNICA: todas las variables de Figma Radix Themes, con modos
│   └── tokens.css                  generado desde tokens.json (npm run tokens:build)
├── contracts/
│   ├── component.schema.json       valida el formato (el editor te avisa)
│   ├── _template.contract.json     plantilla con TODOS los bloques
│   ├── Button.contract.json        componente de acción, v2 con datos de Radix Themes
│   ├── AlertDialog.contract.json   leído de un Figma real (Radix Themes)
│   ├── TextField.contract.json     campo de texto (Radix Themes)
│   ├── Checkbox.contract.json      casilla con estado indeterminado (Radix Themes)
│   ├── Link.contract.json          enlace de texto (navegación)
│   ├── IconButton.contract.json    botón solo con icono (aria-label obligatorio)
│   ├── Switch.contract.json        interruptor con efecto inmediato (Radix Themes)
│   ├── RadioGroup.contract.json    elegir una opción entre pocas (Radix Themes)
│   ├── Divider.contract.json       EJEMPLO MÍNIMO: el contrato más corto, para empezar
│   ├── Icon.contract.json          icono con tamaño y accesibilidad (Lucide)
│   ├── IconLibrary.contract.json   reglas de la librería de iconos y su paso a Figma
│   ├── PhosphorIconLibrary.contract.json  lo mismo con Phosphor (pesos regular y fill)
│   └── Badge.contract.json         etiqueta no interactiva
└── docs/
    ├── contract-guide.md           cómo funciona, rellenar, ejecutar y documentar
    ├── figma.md                    cómo se usa con Figma
    ├── components.md               índice de componentes y vocabulario de props
    ├── icons.md                    iconos con Lucide: instalar, declarar, usar
    ├── tokens-from-figma.md        qué se exportó, modos, nombres, cómo re-exportar
    ├── prompts-nextjs.md           prompts para construir componentes y páginas en Next.js
    ├── nextjs.md                   cómo llevarlo a Next.js
    └── ejercicios.md               ejercicios de la sección 2
```

## El contrato en una frase

Cada `*.contract.json` responde a: **para qué sirve el componente, para qué no, qué props, partes, slots y estados tiene, qué tokens puede usar y cómo es accesible.** Tiene unos bloques núcleo, iguales para todo componente, y bloques opcionales según el tipo (formularios, capas, datos, media). Ver `docs/contract-guide.md`.

## Flujo de trabajo en 5 pasos

1. **Prepara Figma** (variables por uso, auto layout, propiedades y capas con nombre estable): `docs/figma.md`.
2. **Vuelca los tokens** a `tokens/` (ver `docs/tokens-from-figma.md`) y ejecuta `npm run tokens:build`.
3. **Copia `_template.contract.json`**, rellénalo con `docs/contract-guide.md` y borra los bloques que no apliquen.
4. **Ejecuta `node check.mjs`** y añade el componente a `docs/components.md`.
5. **Commit.** El contrato es el cambio: si el componente cambia, cambia primero el contrato (y su `version`). Si todavía no usas Git, mira la sección siguiente.

También puedes hacer los pasos 3–4 con la skill: `skills/ui-contract-builder/` (instalación en `references/project-setup.md`).

Después, en Next.js: `docs/nextjs.md`.

## Git: guardar el historial

Este repo no trae historial: lo creas tú, una sola vez.

```bash
git init -b main
git add .
git commit -m "Sistema de diseño: contratos, tokens y skills"
```

Si es la primera vez que usas Git en este ordenador, antes: `git config --global user.name "Tu nombre"` y `git config --global user.email "tu-correo@ejemplo.com"`. Para subirlo a GitHub: crea un repositorio vacío y sigue las dos líneas que te da (`git remote add origin ...` y `git push -u origin main`). A partir de ahí, cada cambio de contrato es un commit.

## Por dónde empezar

Si es tu primera vez, no abras `Button.contract.json` (es el más largo, casi 800 líneas). Empieza por **`contracts/Divider.contract.json`**: unas 90 líneas, dos props y ningún estado. Cuando lo entiendas, sigue con `Link` e `Icon`, y deja el `Button` para el final.

## Qué NO hay (a propósito)

CI, Storybook, generador de documentación. Se añaden cuando duela no tenerlos.

## Los valores de ejemplo

`tokens/tokens.json` trae las variables de Radix Themes tal como salen de Figma. Si trabajas con tu propio Figma, **sustitúyelas por las tuyas** siguiendo `docs/tokens-from-figma.md`; los contratos de ejemplo seguirán usando los nombres de Radix, así que tendrás que adaptarlos.
