<p align="center">
  <img src="docs/assets/banner.svg" alt="SD Design System: de Figma al código a través de tokens, contratos y agentes de IA" width="100%">
</p>

<h1 align="center">SD Design System</h1>

<p align="center">
  <strong>Un sistema de diseño guiado por contratos.</strong><br>
  Figma diseña, el contrato acuerda y el código se verifica.<br>
  Personas y agentes de IA trabajan con la misma fuente de verdad.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Figma-Variables%20%26%20Components-F24E1E?logo=figma&logoColor=white" alt="Figma">
  <img src="https://img.shields.io/badge/MCP-Figma%20server-000000?logo=modelcontextprotocol&logoColor=white" alt="MCP">
  <img src="https://img.shields.io/badge/Claude%20Code-Skills%20%2B%20Agents-D97757?logo=claude&logoColor=white" alt="Claude Code">
  <img src="https://img.shields.io/badge/Contratos-JSON%20Schema-6366F1?logo=json&logoColor=white" alt="Contratos JSON">
  <img src="https://img.shields.io/badge/Tokens-Light%20%7C%20Dark-0EA5E9" alt="Tokens">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-ESM%20sin%20dependencias-339933?logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-TypeScript-3178C6?logo=typescript&logoColor=white" alt="React + TypeScript">
  <img src="https://img.shields.io/badge/Radix-Themes%20%2B%20Primitives-161618?logo=radixui&logoColor=white" alt="Radix">
  <img src="https://img.shields.io/badge/Iconos-Lucide%20%7C%20Phosphor-F97316" alt="Lucide y Phosphor">
  <img src="https://img.shields.io/badge/a11y-WCAG%202.2-2E7D32" alt="WCAG">
  <img src="https://img.shields.io/badge/Git-GitHub-181717?logo=github&logoColor=white" alt="GitHub">
</p>

<p align="center">
  <a href="#-qué-es">Qué es</a> ·
  <a href="#-cómo-encaja-todo">Cómo encaja</a> ·
  <a href="#-estructura-del-repositorio">Estructura</a> ·
  <a href="#-flujos-de-trabajo">Flujos</a> ·
  <a href="#-empezar">Empezar</a> ·
  <a href="#-documentación">Docs</a>
</p>

---

## 🧭 Qué es

Este repositorio guarda **todo lo que define el sistema de diseño en texto plano y versionable**, para que lo entiendan igual las personas y los agentes de IA:

| Pieza | Qué es | Dónde vive |
| --- | --- | --- |
| **Tokens** | Decisiones visuales con nombre (color, espacio, tipografía, radio, sombra), con modo claro y oscuro. | `tokens/` |
| **Contratos** | Un JSON por componente: para qué sirve y cuándo no usarlo, props, estados, anatomía, tokens, accesibilidad y vínculo con Figma. | `contracts/` |
| **Skills** | Instrucciones para agentes de IA (Claude Code) que crean contratos y componentes sin inventar nada. | `skills/` |
| **Reglas** | Lo que cualquier agente debe cumplir antes de tocar un componente. | `AGENTS.md` |
| **Utilidades** | Scripts que generan CSS, catálogos de iconos y validan la coherencia. | `scripts/`, `check.mjs` |

> **La idea clave:** Figma y el código **no se sincronizan solos**. Los dos se comparan con el mismo contrato. Si no coinciden, decides cuál es el correcto y cambias el otro.

---

## 🗺️ Cómo encaja todo

```mermaid
flowchart LR
  subgraph FIGMA["🎨 Figma"]
    V[Variables<br/>light / dark]
    C[Component sets<br/>props y capas]
    S[Specs<br/>uso, a11y, guía]
  end

  subgraph REPO["📦 Este repositorio · fuente de verdad"]
    TJ[tokens.json] -->|npm run tokens:build| TC[tokens.css]
    K[contracts/*.contract.json]
    A[AGENTS.md + check.mjs]
  end

  subgraph CODE["⚛️ Proyecto Next.js"]
    CSS[CSS Modules]
    TSX[Componente .tsx<br/>data-part + ARIA]
    VER[conformance.mjs]
  end

  V --> TJ
  C <-->|ui-contract-builder<br/>vía MCP| K
  S -->|ui-contract-builder| K
  TC --> CSS
  K -->|contract-to-component| TSX
  A -.reglas.-> TSX
  TSX --> VER
```

### ¿Qué es un contrato?

Un contrato es el **carnet de identidad** de un componente: el acuerdo neutral entre diseño y desarrollo.

```mermaid
mindmap
  root((Contrato))
    Identidad
      id · name · version · status
      description
    Guía de uso
      dos
      donts + useInstead
      related
    API
      props + bindings.figma
      states native / controlled
      events
    Estructura
      anatomy + figmaLayer
      slots
      composition
      layout / autoLayout
    Estilo
      tokens.policy
      tokens.bindings
    Calidad
      a11y WCAG
      testing
    Vínculos
      anchors.figma
      anchors.code
      meta.needsReview
```

Empieza por el contrato más corto, [`contracts/Divider.contract.json`](contracts/Divider.contract.json), y sigue con `Link` e `Icon`. `Button` es el más largo.

---

## 📁 Estructura del repositorio

```text
SD-Design-System/
├── README.md                     ← estás aquí
├── AGENTS.md                     Reglas para cualquier agente de IA en este repo
├── AGENTS.nextjs.md              Plantilla de AGENTS.md para el proyecto Next.js que consume el sistema
├── check.mjs                     Validador: contratos, tokens e iconos (sin dependencias)
├── package.json                  Scripts npm (tokens, check, iconos)
│
├── tokens/                       🎨 Decisiones visuales
│   ├── tokens.json               Única fuente de tokens (exportada de Figma, con modos)
│   └── tokens.css                GENERADO desde tokens.json: no se edita a mano
│
├── contracts/                    📜 Un contrato por componente
│   ├── component.schema.json     JSON Schema que valida todos los contratos
│   ├── _template.contract.json   Plantilla para un componente nuevo
│   ├── Button · IconButton · Link
│   ├── TextField · TextArea · Checkbox · RadioGroup · Switch
│   ├── Form · FormField
│   ├── Badge · Divider · AlertDialog
│   ├── Navbar · NavbarItem · Footer · FooterColumn
│   └── Icon · IconLibrary · PhosphorIconLibrary
│
├── skills/                       🤖 Skills para agentes (Claude Code)
│   ├── ui-contract-builder/      Figma ⇄ contrato (crear, comparar, dibujar)
│   │   ├── SKILL.md
│   │   ├── assets/               Esquema, plantilla y ejemplos (Link, IconButton)
│   │   ├── references/           contract-format · figma-reading · mini-spec ·
│   │   │                         composite-components · contract-to-figma · project-setup
│   │   └── scripts/check.mjs     Validador portátil para otros proyectos
│   └── contract-to-component/    Contrato → React + TypeScript verificado
│       ├── SKILL.md
│       ├── assets/example/icon-button/   Componente real que pasa el verificador
│       ├── references/           implementation-map · parity
│       └── scripts/              gen-css.mjs · conformance.mjs · lib.mjs
│
├── icons/                        🔣 Registros de iconos permitidos (un proyecto usa una librería)
│   ├── lucide/                   registry.json · catalog.json · icons.ts
│   └── phosphor/                 registry.json · catalog.json · icons.ts
│
├── scripts/                      ⚙️ Generadores
│   ├── build-tokens.mjs          tokens.json → tokens.css
│   ├── build-lucide-icons.mjs    registro Lucide → icons.ts
│   ├── build-lucide-catalog.mjs  catálogo completo de Lucide
│   ├── build-lucide-figma.mjs    paso de iconos Lucide a Figma
│   ├── build-phosphor-icons.mjs  registro Phosphor → icons.ts
│   ├── build-phosphor-catalog.mjs
│   └── build-phosphor-figma.mjs
│
└── docs/                         📚 Guías
    ├── assets/banner.svg         Portada de este README
    ├── contract-guide.md         Qué es un contrato y cómo rellenarlo
    ├── figma.md                  Preparar Figma y conectarlo con el contrato
    ├── tokens-from-figma.md      Cómo se exportan y representan los tokens
    ├── components.md             Índice de componentes y vocabulario de props
    ├── icons.md                  Iconos (Lucide / Phosphor)
    ├── nextjs.md                 Llevar el sistema a un proyecto Next.js
    ├── prompts-nextjs.md         Prompts listos para usar con el agente
    └── ejercicios.md             Ejercicios prácticos
```

---

## 🔄 Flujos de trabajo

### 1. Tokens: de Figma al CSS

```mermaid
flowchart LR
  F[Variables y estilos<br/>en Figma] --> J[tokens/tokens.json<br/>fuente de verdad]
  J -->|npm run tokens:build| CSS[tokens/tokens.css]
  CSS --> N["globals.css del proyecto<br/>:root · [data-theme=dark]"]
```

- Los alias se escriben como `{ruta.del.token}`. Los componentes usan la capa semántica, que apunta a primitivos.
- El modo oscuro se aplica solo con `[data-theme="dark"]`, así que **nunca se escriben valores distintos para dark**.

### 2. La skill `ui-contract-builder`: Figma ⇄ contrato vía MCP

Es **bidireccional**. Lee y escribe en Figma a través del servidor MCP y tiene cuatro modos:

```mermaid
flowchart LR
  subgraph F["🎨 Figma (MCP)"]
    F1[Component set]
    F2[Specs / mini-spec]
    F3[Componente nuevo]
    F4[Componente actual]
  end
  subgraph S["🤖 ui-contract-builder"]
    A["A · Figma → contrato"]
    B["B · Spec → contrato"]
    C["C · Contrato → Figma"]
    D["D · Comparar y sincronizar"]
  end
  subgraph K["📜 Contrato"]
    K1[bindings.figma · anatomy]
    K2[draft + needsReview]
    K3[anchors.figma.node]
    K4[version ↑]
  end
  F1 --> A --> K1
  F2 --> B --> K2
  K3 --> C --> F3
  F4 <--> D <--> K4
```

| Modo | Cuándo | Qué hace |
| --- | --- | --- |
| **A** | El componente ya existe en Figma | Lee el nodo **en solo lectura** y rellena lo mecánico: props, estados, anatomía, layout, tokens y anchors. |
| **B** | Solo hay una spec | Crea el contrato en `draft`. Las decisiones propuestas van a `meta.needsReview`. |
| **C** | El contrato existe y Figma no | Dibuja el component set **enlazado a variables reales**. Si falta una variable, se detiene. |
| **D** | Ha cambiado algo | Lista las diferencias. No cambia nada hasta que decides cuál de los dos manda. |

### 3. Crear el contrato de un componente diseñado en Figma

```mermaid
flowchart TD
  IN[Componente + Specs en Figma] --> Q1{¿Existe ya el contrato?}
  Q1 -- sí --> MD[Modo D: sincronizar]
  Q1 -- no --> T[Copiar _template.contract.json]
  T --> R[Leer Figma con MCP<br/>props · states · anatomy · tokens]
  R --> W[Redactar desde la spec<br/>description · guidance · a11y · events]
  W --> Q2{¿Usa piezas sin contrato?}
  Q2 -- sí --> CH[Crear antes el contrato hijo<br/>p. ej. NavbarItem] --> Q2
  Q2 -- no --> NR[Anotar dudas en meta.needsReview<br/>sin hex ni px sueltos]
  NR --> CK{node check.mjs<br/>¿0 errores?}
  CK -- no --> FX[Corregir] --> CK
  CK -- sí --> DEP[Actualizar related y docs/components.md]
  DEP --> REV[Revisión diseño + desarrollo]
  REV --> LNK[Enlazar en Figma<br/>descripción + anchors.figma]
  LNK --> OK([Listo para contract-to-component])
```

### 4. La skill `contract-to-component`: del contrato al código

```mermaid
flowchart LR
  K[Contrato] --> L[Leer contrato,<br/>AGENTS.md y needsReview]
  L --> DEP{¿Dependencias<br/>existen?}
  DEP -- no --> STOP[Parar y listar lo que falta]
  DEP -- sí --> GEN[Crear src/components/id/<br/>tsx · module.css · copia del contrato]
  GEN --> CSS[gen-css.mjs<br/>bloque de tokens generado]
  CSS --> VER{conformance.mjs<br/>¿0 errores?}
  VER -- no --> FIX[Arreglar el código] --> VER
  VER -- sí --> PG[tsc · lint · playground]
```

`conformance.mjs` garantiza que las props, tipos, defaults, partes (`data-part`), estados, ARIA y tokens sean los del contrato, sin hex, sin px sueltos y sin `opacity` en disabled.

### 5. Cuando algo cambia: primero el contrato

```mermaid
flowchart LR
  CH[Cambio necesario] --> K[Editar el contrato<br/>y subir version]
  K --> CK[node check.mjs]
  CK --> FG[Figma: modo C o D]
  CK --> CD[Código: contract-to-component]
```

| Cambio | Versión |
| --- | --- |
| Texto, descripción o guía | `patch` (0.1.**x**) |
| Prop o estado nuevo | `minor` (0.**x**.0) |
| Renombrar o quitar una prop o una propiedad de Figma | `major` (**x**.0.0) |

---

## 🚀 Empezar

**Requisitos:** [Node.js](https://nodejs.org/) 18+. La validación no necesita instalar dependencias.

```bash
# Validar contratos, tokens e iconos
node check.mjs

# Regenerar las variables CSS después de cambiar tokens.json
npm run tokens:build

# Iconos Phosphor: registro, catálogo y paso a Figma
npm run phosphor:build
npm run phosphor:catalog
npm run phosphor:figma
```

### Pasos a seguir

1. **Prepara Figma:** variables con nombre por uso (`color/fill/brand/default`), component sets con propiedades claras, auto layout y capas con el mismo nombre que las claves de `anatomy`. Ver [`docs/figma.md`](docs/figma.md).
2. **Vuelca los tokens** a `tokens/tokens.json` y ejecuta `npm run tokens:build`.
3. **Crea el contrato** con `ui-contract-builder` (modo A o B) o a mano desde la plantilla.
4. **Valida** con `node check.mjs` hasta que no queden errores y revisa `meta.needsReview` con el equipo.
5. **Dibuja o compara en Figma** con los modos C y D.
6. **Implementa** con `contract-to-component` y pasa `conformance.mjs`.
7. **Registra** el componente en `docs/components.md` y haz commit.

### Con Claude Code

```text
Crea el contrato de este componente de Figma: <enlace al nodo>
Compara el componente de Figma <enlace> con contracts/Navbar.contract.json
Dibuja en Figma el componente Badge desde su contrato
Implementa el componente Button desde su contrato
```

El agente lee [`AGENTS.md`](AGENTS.md) antes de tocar nada. **Si algo no está en el contrato, pregunta. No rellena huecos con suposiciones.**

---

## 📏 Reglas de oro

- ✅ Solo se usan tokens de `tokens.bindings` y de las categorías de `tokens.policy.allowed`.
- ✅ Cada parte de `anatomy` lleva `data-part="<clave>"` y el `ref` va en `semantics.refTarget`.
- ✅ Los estados `native` se resuelven con CSS y los `controlled` son props con su atributo ARIA.
- ❌ Ni colores hex ni px sueltos.
- ❌ Disabled nunca se hace con `opacity`: se usan los tokens `*.disabled`.
- ❌ `tokens.css` no se edita a mano.
- ❌ Ningún cambio en código ni en Figma antes que en el contrato.

---

## 📚 Documentación

| Documento | Para qué sirve |
| --- | --- |
| [`docs/contract-guide.md`](docs/contract-guide.md) | Cómo funciona un contrato y cómo rellenarlo |
| [`docs/figma.md`](docs/figma.md) | Preparar Figma y conectarlo con el contrato |
| [`docs/tokens-from-figma.md`](docs/tokens-from-figma.md) | Tokens: origen, modos y generación de CSS |
| [`docs/components.md`](docs/components.md) | Índice de componentes y vocabulario de props |
| [`docs/icons.md`](docs/icons.md) | Iconos con Lucide o Phosphor |
| [`docs/nextjs.md`](docs/nextjs.md) | Llevar el sistema a un proyecto Next.js |
| [`docs/prompts-nextjs.md`](docs/prompts-nextjs.md) | Prompts listos para trabajar con el agente |
| [`docs/ejercicios.md`](docs/ejercicios.md) | Ejercicios prácticos para aprender el sistema |

---

## 🧩 Valores de ejemplo

`tokens/tokens.json` trae las variables de **Radix Themes (Community)** tal como salen de Figma, y los contratos de ejemplo usan esos nombres. Si trabajas con tu propio Figma, sustitúyelas siguiendo [`docs/tokens-from-figma.md`](docs/tokens-from-figma.md) y adapta los `tokens.bindings`.

## 🚫 Qué no incluye (a propósito)

CI, Storybook y un generador de documentación. Se añaden cuando hagan falta.

---

<p align="center">
  Hecho con 🎨 Figma · 📜 contratos · 🤖 Claude Code<br>
  <sub>Contrato primero, y luego Figma y código.</sub>
</p>