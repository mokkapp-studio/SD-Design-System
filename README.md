<p align="center">
  <img src="docs/assets/banner.svg" alt="Sistema de diseño: de Figma al código a través de tokens, contratos y agentes de IA" width="100%">
</p>

<h1 align="center">Sistema de diseño</h1>

<p align="center">
  <strong>La fuente de verdad de tu sistema de diseño, en archivos que entienden tanto las personas como los agentes de IA.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-ESM-339933?logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Figma-Variables-F24E1E?logo=figma&logoColor=white" alt="Figma">
  <img src="https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-TypeScript-3178C6?logo=typescript&logoColor=white" alt="React y TypeScript">
  <img src="https://img.shields.io/badge/Radix%20Themes-Tokens-3E63DD?logo=radixui&logoColor=white" alt="Radix Themes">
  <img src="https://img.shields.io/badge/Iconos-Lucide%20%7C%20Phosphor-F97316" alt="Lucide y Phosphor">
  <img src="https://img.shields.io/badge/Contratos-JSON-6366F1" alt="Contratos JSON">
  <img src="https://img.shields.io/badge/Agentes-Claude%20Code-D97757" alt="Agentes de IA">
  <img src="https://img.shields.io/badge/Git-GitHub-181717?logo=github&logoColor=white" alt="Git y GitHub">
</p>

---

## Qué es

Este repositorio guarda, en texto plano y versionable, todo lo que define tu sistema de diseño:

- **Tokens**: colores, espacios, tipografía y radios, con sus modos (claro y oscuro), exportados desde Figma.
- **Contratos**: un JSON por componente que describe para qué sirve, qué props, estados, partes y tokens usa, y cómo debe comportarse en accesibilidad.
- **Skills y reglas para IA**: instrucciones que permiten a un agente crear contratos y componentes sin inventar nada que no esté en el contrato.
- **Utilidades**: scripts que generan el CSS de tokens, los catálogos de iconos y comprueban que todo es coherente.

Figma y código **no se sincronizan solos**: los dos se comprueban contra el mismo contrato.

```
Figma (componentes + variables)
        │  lo describes una vez
        ▼
tokens/tokens.json  +  contracts/*.contract.json     ← este repo
        │  los lee el agente
        ▼
Código (Next.js: componente.tsx + CSS + contrato al lado)
```

## Contenido principal

| Parte | Qué encontrarás |
| --- | --- |
| `tokens/` | Variables de diseño. `tokens.json` es la única fuente; `tokens.css` se genera desde él. |
| `contracts/` | Contratos de componentes (Button, TextField, Navbar, Footer, Form, Icon…) y una plantilla para nuevos. |
| `skills/` | Dos skills para agentes: `ui-contract-builder` (crea contratos) y `contract-to-component` (implementa el código y lo verifica). |
| `icons/` | Registros de iconos permitidos en código, con alternativas Lucide y Phosphor. |
| `scripts/` | Generadores de tokens, iconos y catálogos. |
| `docs/` | Guías: cómo escribir contratos, cómo usar Figma, Next.js, componentes y ejercicios. |
| `AGENTS.md` | Reglas que debe seguir cualquier agente de IA que trabaje con el sistema. |

## Empezar

**Requisitos:** [Node.js](https://nodejs.org/) para ejecutar los scripts. No hay dependencias que instalar para la comprobación.

```bash
# Comprobar contratos y tokens
node check.mjs

# Regenerar las variables CSS después de cambiar tokens.json
npm run tokens:build
```

Si es tu primera vez, no abras `Button.contract.json` (es el más largo). Empieza por **`contracts/Divider.contract.json`**, el contrato más corto, y sigue con `Link` e `Icon`.

## Flujo de trabajo

1. **Prepara Figma**: variables por uso, auto layout y capas con nombre estable. Guía en `docs/figma.md`.
2. **Vuelca los tokens** a `tokens/` y ejecuta `npm run tokens:build`. Guía en `docs/tokens-from-figma.md`.
3. **Crea el contrato** desde `contracts/_template.contract.json` o con la skill `ui-contract-builder`. Guía en `docs/contract-guide.md`.
4. **Implementa el componente** con la skill `contract-to-component` o a mano, siguiendo el contrato.
5. **Comprueba y guarda**: `node check.mjs`, añade el componente a `docs/components.md` y haz commit. Si el componente cambia, **cambia primero el contrato** y su `version`.

## Skills y agentes

Las skills son instrucciones reutilizables que un agente de IA carga cuando la tarea encaja:

- **`ui-contract-builder`**: crea, actualiza y valida contratos a partir de un nodo de Figma o de una mini-especificación.
- **`contract-to-component`**: convierte un contrato en un componente React + TypeScript y demuestra que cumple lo que dice el contrato.

El agente lee `AGENTS.md` antes de tocar cualquier componente, y no rellena huecos del contrato con suposiciones: si algo no está definido, pregunta.

## Git

Este repositorio es un punto de partida: el historial lo creas tú.

```bash
git init -b main
git add .
git commit -m "Sistema de diseño: contratos, tokens y skills"
```

Para subirlo a GitHub, crea un repositorio vacío y sigue las líneas que te muestre (`git remote add origin ...` y `git push -u origin main`). A partir de ahí, cada cambio de contrato es un commit.

## Los valores de ejemplo

`tokens/tokens.json` trae las variables de **Radix Themes** tal como salen de Figma. Si trabajas con tu propio Figma, sustitúyelas por las tuyas siguiendo `docs/tokens-from-figma.md`. Los contratos de ejemplo usan los nombres de Radix, así que tendrás que adaptarlos.

## Qué no incluye (a propósito)

CI, Storybook y generador de documentación. Se añaden cuando hagan falta.

## Documentación

| Documento | Para qué sirve |
| --- | --- |
| [`docs/contract-guide.md`](docs/contract-guide.md) | Cómo funciona un contrato y cómo rellenarlo |
| [`docs/figma.md`](docs/figma.md) | Preparar Figma para que el sistema encaje |
| [`docs/components.md`](docs/components.md) | Índice de componentes y vocabulario de props |
| [`docs/icons.md`](docs/icons.md) | Iconos con Lucide: instalar, declarar y usar |
| [`docs/nextjs.md`](docs/nextjs.md) | Llevar el sistema a un proyecto Next.js |
| [`docs/ejercicios.md`](docs/ejercicios.md) | Ejercicios prácticos |
