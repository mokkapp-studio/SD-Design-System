#!/usr/bin/env node
// Genera el archivo de reexportación de iconos a partir de icons/lucide/registry.json (sin dependencias).
//   node scripts/build-lucide-icons.mjs [ruta-de-salida]
// Por defecto: icons/lucide/icons.ts. En un proyecto Next.js: node design-system/scripts/build-lucide-icons.mjs src/components/icon/icons.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reg = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'lucide', 'registry.json'), 'utf8'));
const out = path.resolve(process.argv[2] ?? path.join(root, 'icons', 'lucide', 'icons.ts'));

const names = reg.icons.map((i) => i.name);
const bad = names.filter((n) => !/^[A-Z][A-Za-z0-9]*$/.test(n));
if (bad.length) throw new Error(`Nombres no válidos (PascalCase): ${bad.join(', ')}`);
if (new Set(names).size !== names.length) throw new Error('Nombres duplicados en icons/lucide/registry.json');
const sorted = [...names].sort();

const src = `/* GENERADO por scripts/build-lucide-icons.mjs desde icons/lucide/registry.json. No editar a mano. */
import { ${sorted.join(', ')} } from '${reg.library}';

export type { LucideIcon } from '${reg.library}';
export { ${sorted.join(', ')} };
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, src);
console.log(`${path.relative(process.cwd(), out)}: ${sorted.length} iconos`);
