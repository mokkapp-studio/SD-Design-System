# Componentes

Índice de componentes y vocabulario común. Si un componente no está aquí, no existe todavía.

## Índice

| Componente | Contrato | Tipo | Estado | Cuándo usarlo | Relacionados |
| --- | --- | --- | --- | --- | --- |
| Button | `contracts/Button.contract.json` | acción (Radix Themes, v2) | draft | Lanzar una acción con etiqueta | Link, Toggle, IconButton |
| Link | `contracts/Link.contract.json` | navegación (Radix Themes) | draft | Navegar a otra página o recurso | Button |
| IconButton | `contracts/IconButton.contract.json` | acción (Radix Themes) | draft | Acción solo con icono; `aria-label` obligatorio | Button, Icon, TextField |
| AlertDialog | `contracts/AlertDialog.contract.json` | capa (Radix Themes) | draft | Confirmar una acción que interrumpe | Dialog |
| TextField | `contracts/TextField.contract.json` | campo (Radix Themes) | draft | Texto de una línea (usa IconButton como botón final) | TextArea, Select, IconButton |
| Checkbox | `contracts/Checkbox.contract.json` | campo (Radix Themes) | draft | Opción independiente, con estado indeterminado | CheckboxGroup, RadioGroup, Switch |
| RadioGroup | `contracts/RadioGroup.contract.json` | campo (Radix Themes) | draft | Elegir una opción entre pocas | Checkbox, Select, Switch |
| Switch | `contracts/Switch.contract.json` | campo (Radix Themes) | draft | Ajuste con efecto inmediato | Checkbox, RadioGroup, Button |
| Icon | `contracts/Icon.contract.json` | media (Lucide) | draft | Icono con tamaño y accesibilidad coherentes | Button, IconButton, TextField |
| Divider | `contracts/Divider.contract.json` | contenedor (ejemplo mínimo) | draft | Separar dos grupos de contenido; **el contrato más corto, para empezar** | — |
| _siguiente_ | | | pendiente | | |

> Un componente por vez: límpialo en Figma, haz su contrato, llévalo a código y recién entonces el siguiente.

## Vocabulario de props

Si dos componentes llaman distinto a lo mismo, ni las personas ni la IA aciertan. Usa estos nombres siempre.

| Concepto | Nombre | Valores / tipo | No usar |
| --- | --- | --- | --- |
| Énfasis visual | `variant` | según componente | `kind`, `type`, `appearance` |
| Tamaño | `size` | `'1'`…`'4'` (Radix) o `s`, `m`, `l` en sistemas propios | `small`, `large` |
| Significado cromático | `color` | `accent`, `neutral`, `error` | `intent`, `tone`, `danger` |
| Contraste reforzado | `highContrast` | boolean | `highConstrast` (errata del eje en el Figma de Radix) |
| No disponible | `disabled` | boolean | `isDisabled`, `inactive` |
| Acción en curso | `loading` | boolean | `isLoading`, `busy` |
| Icono inicial / final | `icon` / `iconEnd` | nodo | `leftIcon`, `rightIcon` |
| Ancho completo | `fullWidth` | boolean | `block`, `stretch` |
| Pulsación | `onPress` | función | `onClick` |
| Contenido principal | `children` | nodo | `text`, `title` |
| Slots con nombre | `header`, `footer`… | nodo | `top`, `bottom`, `renderHeader` |
| Elemento raíz | `as` | cadena | `tag`, `component` |

Añade filas cuando un segundo componente comparta una propiedad. Cambiar un nombre ya usado es un cambio major de `version` en todos los contratos afectados.
