#!/usr/bin/env node
// Ejecuta conformance.mjs en cada carpeta de componentes. Sale con 1 si alguna falla.
//   node conformance-all.mjs <carpeta-de-componentes> [--ds <raíz>]
// Una carpeta sin *.contract.json es un error: o es un componente a medias o sobra.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const base = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--ds');
const ds = args.includes('--ds') ? ['--ds', args[args.indexOf('--ds') + 1]] : [];
if (!base || !fs.existsSync(base)) { console.error('Uso: node conformance-all.mjs <carpeta-de-componentes> [--ds raíz]'); process.exit(2); }
const verifier = path.join(path.dirname(fileURLToPath(import.meta.url)), 'conformance.mjs');

let failed = 0, total = 0;
for (const d of fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
  const dir = path.join(base, d);
  total++;
  if (!fs.readdirSync(dir).some((f) => f.endsWith('.contract.json'))) {
    console.log(`\n── ${d}\nERROR   carpeta sin *.contract.json: complétala o bórrala`);
    failed++; continue;
  }
  console.log(`\n── ${d}`);
  const r = spawnSync(process.execPath, [verifier, dir, ...ds], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
console.log(`\n${total - failed}/${total} componentes cumplen su contrato`);
process.exit(failed ? 1 : 0);
