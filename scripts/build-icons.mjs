#!/usr/bin/env node
// Genera el archivo de reexportación de iconos a partir de icons/registry.json (sin dependencias).
//   node scripts/build-icons.mjs [ruta-de-salida]
// Por defecto: icons/icons.ts. En un proyecto Next.js: node design-system/scripts/build-icons.mjs src/components/icon/icons.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reg = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'registry.json'), 'utf8'));
const out = path.resolve(process.argv[2] ?? path.join(root, 'icons', 'icons.ts'));

const names = reg.icons.map((i) => i.name);
const bad = names.filter((n) => !/^[A-Z][A-Za-z0-9]*$/.test(n));
if (bad.length) throw new Error(`Nombres no válidos (PascalCase): ${bad.join(', ')}`);
if (new Set(names).size !== names.length) throw new Error('Nombres duplicados en icons/registry.json');
const sorted = [...names].sort();

const src = `/* GENERADO por scripts/build-icons.mjs desde icons/registry.json. No editar a mano. */
import { ${sorted.join(', ')} } from '${reg.library}';

export type { LucideIcon } from '${reg.library}';
export { ${sorted.join(', ')} };
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, src);
console.log(`${path.relative(process.cwd(), out)}: ${sorted.length} iconos`);
