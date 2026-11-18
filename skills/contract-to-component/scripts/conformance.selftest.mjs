#!/usr/bin/env node
// Prueba del propio verificador: el ejemplo IconButton debe pasar, y cada error sembrado debe fallar.
//   node conformance.selftest.mjs        (desde un proyecto con typescript instalado)
// Si un error sembrado pasa, el verificador tiene un agujero: arréglalo antes de fiarte de él.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const example = path.join(here, '..', 'assets', 'example', 'icon-button');
const verifier = path.join(here, 'conformance.mjs');
const dsRoot = path.resolve(here, '..', '..', '..'); // skills/contract-to-component/scripts → raíz
const ds = fs.existsSync(path.join(dsRoot, 'tokens')) ? ['--ds', dsRoot] : [];

const T = 'icon-button.tsx', C = 'icon-button.module.css';
const M = [
  ['variante inventada en el tipo', T, (s) => s.replace("variant?: 'classic'", "variant?: 'fancy' | 'classic'")],
  ['boolean declarado como string', T, (s) => s.replace('highContrast?: boolean', 'highContrast?: string')],
  ['prop que no está en el contrato', T, (s) => s.replace('  loading?: boolean;', '  loading?: boolean;\n  tone?: string;')],
  ['default distinto del contrato', T, (s) => s.replace("variant = 'solid'", "variant = 'soft'")],
  ['data-part solo en un comentario', T, (s) => s.replace('data-part="icon" ', '/* data-part="icon" */ ')],
  ['ref fuera de refTarget', T, (s) => s.replace('      ref={ref}\n', '')],
  ['falta el ARIA de un estado', T, (s) => s.replace('aria-busy={loading || undefined}', '')],
  ['estilo en línea', T, (s) => s.replace('data-part="root"', 'data-part="root"\n      style={{ margin: 0 }}')],
  ['import directo de iconos', T, (s) => s.replace("import styles", "import { X } from 'lucide-react';\nimport styles")],
  ['any', T, (s) => s.replace('}: IconButtonProps)', '}: IconButtonProps & { x?: any })')],
  ['data-state en el JSX', T, (s) => s.replace('data-part="root"', 'data-part="root"\n      data-state="on"')],
  ['versión de @contract atrasada', T, (s) => s.replace(/@contract IconButton@[\d.]+/, '@contract IconButton@0.0.1')],
  ['color con nombre', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer;\n  color: red;')],
  ['color hexadecimal', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer;\n  color: #f00;')],
  ['rem suelto', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer;\n  padding: 1.3rem;')],
  ['px que no está en el contrato', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer;\n  margin: 13px;')],
  ['duración inventada', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer;\n  transition: color 200ms;')],
  ['!important', C, (s) => s.replace('cursor: pointer;', 'cursor: pointer !important;')],
  ['opacity en disabled', C, (s) => s.replace('cursor: not-allowed;', 'cursor: not-allowed;\n  opacity: 0.5;')],
  ['filter en disabled', C, (s) => s.replace('cursor: not-allowed;', 'cursor: not-allowed;\n  filter: grayscale(1) opacity(0.4);')],
  ['sin foco visible', C, (s) => s.replace(/:focus-visible/g, ':hover')],
  ['token que no está en el contrato', C, (s) => s.replace('background-color: transparent;', 'background-color: var(--colors-accent-accent-1);')],
  ['selector [data-state]', C, (s) => s + '\n.root[data-state="on"] { cursor: pointer; }\n'],
];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'conformance-self-'));
const run = (dir) => spawnSync(process.execPath, [verifier, dir, '--contract', path.join(dir, 'IconButton.contract.json'), ...ds], { encoding: 'utf8' });
const copy = (name) => { const d = path.join(tmp, name); fs.cpSync(example, d, { recursive: true }); return d; };

let bad = 0;
const base = run(copy('base'));
if (base.status !== 0) { console.log('✖ el ejemplo limpio no pasa:\n' + base.stdout + base.stderr); process.exit(1); }
console.log('✔ el ejemplo limpio pasa');
M.forEach(([label, file, fn], i) => {
  const d = copy(`m${i}`);
  const f = path.join(d, file);
  const before = fs.readFileSync(f, 'utf8'); const after = fn(before);
  if (after === before) { console.log(`✖ ${label}: la mutación no se aplicó (¿ha cambiado el ejemplo?)`); bad++; return; }
  fs.writeFileSync(f, after);
  const r = run(d);
  if (r.status === 1) console.log(`✔ detecta: ${label}`);
  else { console.log(`✖ NO detecta: ${label}`); bad++; }
});
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${M.length - bad}/${M.length} errores sembrados detectados`);
process.exit(bad ? 1 : 0);
