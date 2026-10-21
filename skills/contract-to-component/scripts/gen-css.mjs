#!/usr/bin/env node
// Genera el CSS de tokens de un componente a partir de tokens.bindings del contrato.
//   node gen-css.mjs <Contrato.contract.json> [--ds <raíz>] [--class root] [--write <archivo.module.css>]
// Sin --write imprime por la salida estándar. Con --write reemplaza el bloque entre
//   /* @generated:start */ y /* @generated:end */ (lo crea al final si no existe).
// Selectores con :where() para que la especificidad sea predecible; el orden manda.
import fs from 'node:fs';
import path from 'node:path';
import { kebab, readJson, findRoot, loadTokenNames, toVar, propInfo, placeholders, resolve } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const file = args.find((a) => a.endsWith('.json'));
if (!file) { console.error('Uso: node gen-css.mjs <Contrato.contract.json> [--ds raíz] [--class root] [--write archivo.module.css]'); process.exit(2); }
const contract = readJson(file);
const cls = opt('--class', 'root');
const root = findRoot(opt('--ds')) ?? path.resolve(path.dirname(file), '..');
const tokenNames = loadTokenNames(root);
const { enums, bools } = propInfo(contract);
const scales = contract.tokens?.scales ?? {};
const b = contract.tokens?.bindings ?? {};
const unmapped = new Set(); const missing = new Set();

const attr = (p, v) => (bools.has(p) ? (v === 'false' ? `:not([data-${kebab(p)}])` : `[data-${kebab(p)}]`) : `[data-${kebab(p)}="${v}"]`);
const tok = (t) => { if (tokenNames && !tokenNames.has(t)) missing.add(t); return toVar(t); };

const PROPS = {
  background: (v) => [['background-color', v === null ? 'transparent' : tok(v)]],
  text: (v) => (v === null ? [] : [['color', tok(v)]]),
  iconColor: (v) => (v === null ? [] : [['color', tok(v)]]),
  border: (v) => [['border-color', v === null ? 'transparent' : tok(v)]],
  borderWidth: (v) => [['border-width', `${v}px`], ['border-style', 'solid']],
  shadow: (v) => [['box-shadow', v === null ? 'none' : tok(v)]],
  opacity: (v) => [['opacity', String(v)]],
  height: (v) => [['height', tok(v)]],
  size: (v) => [['width', tok(v)], ['height', tok(v)]],
  paddingX: (v) => [['padding-inline', tok(v)]],
  gap: (v) => [['gap', tok(v)]],
  radius: (v) => [['border-radius', tok(v)]],
  textStyle: (v) => [['font', tok(v)], ['letter-spacing', toVar(v + '-letter-spacing')]],
};

// Declaraciones de un objeto { clave: valor } para una combinación; null en escala = valor null
function decls(obj, combo) {
  const out = [];
  for (const [k, v0] of Object.entries(obj)) {
    if (k.startsWith('focusRing')) continue;
    if (v0 && typeof v0 === 'object') { unmapped.add(k); continue; }
    const fn = PROPS[k];
    if (!fn) { unmapped.add(k); continue; }
    const v = typeof v0 === 'string' ? resolve(v0, combo, scales) : v0;
    out.push(...fn(v));
  }
  return out;
}
const dimsOf = (obj) => [...new Set(Object.values(obj).filter((v) => typeof v === 'string').flatMap((s) => placeholders(s).map((p) => p.prop)))];
const rules = [];
function emit(attrs, pseudo, obj, comment) {
  if (!obj || !Object.keys(obj).length) return;
  const dims = dimsOf(obj).filter((d) => enums[d]);
  const combos = dims.reduce((acc, d) => acc.flatMap((c) => enums[d].map((v) => ({ ...c, [d]: v }))), [{}]);
  for (const combo of combos) {
    const d = decls(obj, combo);
    if (!d.length) continue;
    const all = [...attrs, ...dims.map((x) => attr(x, combo[x]))];
    const sel = `.${cls}${all.length ? `:where(${all.join('')})` : ''}${pseudo}`;
    rules.push(`${sel} {\n${d.map(([p, v]) => `  ${p}: ${v};`).join('\n')}\n}`);
  }
}
const STATE = { default: '', hover: ':hover:not(:disabled)', active: ':active:not(:disabled)' };
function states(attrs, obj) {
  const plain = Object.fromEntries(Object.entries(obj).filter(([k]) => !(k in STATE)));
  emit(attrs, '', plain);
  for (const [s, pseudo] of Object.entries(STATE)) if (obj[s]) emit(attrs, pseudo, obj[s]);
}

// 1. base, 2. bySize, 3. byVariant, 4. byHighContrast, 5. byState.disabled, 6. subrayado
emit([], '', b.base);
for (const [s, o] of Object.entries(b.bySize ?? {})) emit([attr('size', s)], '', o);
for (const [v, o] of Object.entries(b.byVariant ?? {})) states([attr('variant', v)], o);
for (const [v, o] of Object.entries(b.byHighContrast ?? {})) {
  if (v === 'true' || v === 'false') emit([attr('highContrast', v)], '', o);
  else states([attr('variant', v), attr('highContrast', 'true')], o);
}
for (const [v, o] of Object.entries(b.byState?.disabled ?? {})) emit([attr('variant', v)], ':disabled', o);
if (b.underline?.color) {
  rules.push(`.${cls}:where([data-underline]) {\n  text-decoration-line: underline;\n  text-decoration-color: ${tok(b.underline.color)};\n  text-decoration-thickness: ${b.underline.width ?? 1}px;\n}`);
}

const head = `/* GENERADO por gen-css.mjs desde ${contract.name}.contract.json@${contract.version}. No editar a mano: cambia el contrato y regenera. */`;
const note = [];
if (unmapped.size) note.push(`/* Sin traducir (escríbelo a mano): ${[...unmapped].join(', ')} */`);
const block = `/* @generated:start */\n${head}\n${note.join('\n')}${note.length ? '\n' : ''}${rules.join('\n\n')}\n/* @generated:end */`;

const target = opt('--write');
if (target) {
  let css = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  const re = /\/\* @generated:start \*\/[\s\S]*?\/\* @generated:end \*\//;
  css = re.test(css) ? css.replace(re, () => block) : css + (css && !css.endsWith('\n') ? '\n' : '') + (css ? '\n' : '') + block + '\n';
  fs.writeFileSync(target, css);
  console.log(`${target}: ${rules.length} reglas generadas`);
} else console.log(block);
if (missing.size) { console.error(`AVISO tokens que no existen: ${[...missing].join(', ')}`); process.exitCode = 1; }
if (unmapped.size) console.error(`AVISO claves sin traducir: ${[...unmapped].join(', ')}`);
