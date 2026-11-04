#!/usr/bin/env node
// Genera el archivo de reexportación de iconos de Phosphor a partir de icons/phosphor/registry.json (sin dependencias).
//   node scripts/build-phosphor-icons.mjs [ruta-de-salida]
// Por defecto: icons/phosphor/icons.ts. En un proyecto Next.js: node design-system/scripts/build-phosphor-icons.mjs src/components/icon/icons.ts
// El paquete exporta «ArrowRightIcon»; aquí se reexporta como «ArrowRight», igual que con Lucide,
// así los componentes no cambian si un proyecto pasa de una librería a otra.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reg = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'phosphor', 'registry.json'), 'utf8'));
const out = path.resolve(process.argv[2] ?? path.join(root, 'icons', 'phosphor', 'icons.ts'));

const names = reg.icons.map((i) => i.name);
const bad = names.filter((n) => !/^[A-Z][A-Za-z0-9]*$/.test(n) || n.endsWith('Icon'));
if (bad.length) throw new Error(`Nombres no válidos (PascalCase, sin el sufijo Icon): ${bad.join(', ')}`);
if (new Set(names).size !== names.length) throw new Error('Nombres duplicados en icons/phosphor/registry.json');
const sorted = [...names].sort();

// /ssr: sin React Context, funciona en Server y Client Components de Next.js.
const src = `/* GENERADO por scripts/build-phosphor-icons.mjs desde icons/phosphor/registry.json. No editar a mano. */
import { ${sorted.map((n) => `${n}Icon`).join(', ')} } from '${reg.library}/ssr';

export type { Icon as PhosphorIcon, IconWeight } from '${reg.library}';
export const weights = ${JSON.stringify(reg.weights)} as const;
export { ${sorted.map((n) => `${n}Icon as ${n}`).join(', ')} };
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, src);
console.log(`${path.relative(process.cwd(), out)}: ${sorted.length} iconos`);
