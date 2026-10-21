// Utilidades comunes de gen-css.mjs y conformance.mjs. Sin dependencias.
import fs from 'node:fs';
import path from 'node:path';

export const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// Raíz del sistema de diseño: la dada, o la primera carpeta con contracts/ subiendo desde cwd (también design-system/)
export function findRoot(arg) {
  if (arg) return path.resolve(arg);
  let dir = process.cwd();
  for (;;) {
    for (const c of [dir, path.join(dir, 'design-system')]) if (fs.existsSync(path.join(c, 'contracts', 'component.schema.json'))) return c;
    const up = path.dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

// Nombres de token existentes ("colors.accent.accent.9") a partir de tokens/tokens.json
export function loadTokenNames(root) {
  const names = new Set();
  const dir = path.join(root, 'tokens');
  if (!fs.existsSync(dir)) return null;
  const list = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? list(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []);
  const walk = (o, p = []) => { for (const [k, v] of Object.entries(o)) { if (k.startsWith('$') || !v || typeof v !== 'object') continue; if ('$value' in v) names.add([...p, k].join('.')); else walk(v, [...p, k]); } };
  for (const f of list(dir)) walk(readJson(f));
  return names;
}

export const toVarName = (token) => '--' + token.split('.').join('-');
export const toVar = (token) => `var(${toVarName(token)})`;

// Enums por prop: { variant: ['classic', ...], size: ['1', ...] } y props booleanas
export function propInfo(contract) {
  const enums = {}; const bools = new Set();
  for (const p of contract.props ?? []) {
    const vals = [...String(p.type).matchAll(/'([^']+)'/g)].map((m) => m[1]);
    if (vals.length) enums[p.name] = vals;
    if (String(p.type).trim() === 'boolean') bools.add(p.name);
  }
  return { enums, bools };
}

// Placeholders de una cadena: [{ph:'{color.step}', prop:'color', key:'step'}]
export const placeholders = (s) => [...String(s).matchAll(/\{(\w+)(?:\.(\w+))?\}/g)].map((m) => ({ ph: m[0], prop: m[1], key: m[2] }));

// Resuelve una cadena con una combinación { color:'accent', size:'2' }. Devuelve null si una escala dice null.
export function resolve(s, combo, scales) {
  let out = s;
  for (const { ph, prop, key } of placeholders(s)) {
    const v = combo[prop];
    if (v === undefined) throw new Error(`falta valor de «${prop}» para ${s}`);
    if (!key) { out = out.replace(ph, v); continue; }
    const sc = scales?.[v]?.[key];
    if (sc === undefined) throw new Error(`tokens.scales.${v}.${key} no existe (${s})`);
    if (sc === null) return null;
    out = out.replace(ph, sc);
  }
  return out;
}

// Todos los tokens que el contrato permite usar en CSS (strings de tokens.bindings, expandidos)
export function boundTokens(contract) {
  const { enums } = propInfo(contract);
  const scales = contract.tokens?.scales ?? {};
  const set = new Set();
  const walk = (o) => {
    if (typeof o === 'string') {
      const phs = placeholders(o); const props = [...new Set(phs.map((p) => p.prop))];
      const combos = props.reduce((acc, p) => acc.flatMap((c) => (enums[p] ?? []).map((v) => ({ ...c, [p]: v }))), [{}]);
      for (const c of combos) { const r = resolve(o, c, scales); if (r) set.add(r); }
    } else if (o && typeof o === 'object') Object.values(o).forEach(walk);
  };
  walk(contract.tokens?.bindings ?? {});
  return set;
}

// Números sueltos permitidos (px) y opacity del contrato
export function numericValues(contract) {
  const px = new Set([0]); const opacity = new Set();
  const walk = (o, key = '') => {
    if (typeof o === 'number') { if (key === 'opacity') opacity.add(o); else px.add(o); }
    else if (Array.isArray(o)) o.forEach((x) => walk(x, key));
    else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, k === 'values' ? key : k);
  };
  walk(contract.tokens?.bindings ?? {}); walk(contract.layout ?? {});
  return { px, opacity };
}
