#!/usr/bin/env node
// Comprueba que un componente (tsx + module.css) cumple su contrato. Sin dependencias.
//   node conformance.mjs <carpeta-del-componente> [--contract <ruta>] [--ds <raíz>]
// La carpeta contiene <id>.tsx, <id>.module.css y <Nombre>.contract.json (copia del contrato).
// Sale con código 1 si hay errores. Los avisos no fallan.
import fs from 'node:fs';
import path from 'node:path';
import { kebab, readJson, findRoot, loadTokenNames, toVarName, propInfo, boundTokens, numericValues } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const dir = args.find((a) => !a.startsWith('--') && a !== opt('--contract') && a !== opt('--ds'));
if (!dir || !fs.existsSync(dir)) { console.error('Uso: node conformance.mjs <carpeta-del-componente> [--contract ruta] [--ds raíz]'); process.exit(2); }

const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const files = fs.readdirSync(dir);
const copyName = files.find((f) => f.endsWith('.contract.json'));
if (!copyName) { console.error(`No hay *.contract.json en ${dir}: copia el contrato junto al componente.`); process.exit(2); }
const copy = readJson(path.join(dir, copyName));
const root = findRoot(opt('--ds'));
const sourcePath = opt('--contract') ?? (root ? path.join(root, 'contracts', copyName) : null);
const id = copy.id ?? kebab(copy.name);
const tsxName = files.find((f) => f === `${id}.tsx`) ?? files.find((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));
const cssName = files.find((f) => f === `${id}.module.css`) ?? files.find((f) => f.endsWith('.module.css'));
if (!tsxName) err(`falta ${id}.tsx`);
if (!cssName) err(`falta ${id}.module.css`);
if (!tsxName || !cssName) { for (const e of errors) console.log('ERROR  ', e); process.exit(1); }
const tsx = fs.readFileSync(path.join(dir, tsxName), 'utf8');
const css = fs.readFileSync(path.join(dir, cssName), 'utf8');
const c = copy;
const Name = c.name;
const { enums, bools } = propInfo(c);

// 1. La copia es idéntica al contrato fuente y la versión está anotada
if (sourcePath && fs.existsSync(sourcePath)) {
  if (JSON.stringify(readJson(sourcePath)) !== JSON.stringify(copy)) err(`${copyName} no es idéntico a ${path.relative(process.cwd(), sourcePath)}: vuelve a copiarlo (o sube la versión en el contrato)`);
} else warn('no encuentro el contrato fuente para comparar la copia (usa --contract o --ds)');
const header = tsx.match(/@contract\s+(\w+)@(\d+\.\d+\.\d+)/);
if (!header) err(`falta el comentario «@contract ${Name}@${c.version}» al principio del tsx`);
else if (header[1] !== Name || header[2] !== c.version) err(`el tsx dice @contract ${header[1]}@${header[2]}; el contrato es ${Name}@${c.version}`);

// 2. Export y tipo de props
if (!new RegExp(`export\\s+(?:default\\s+)?(?:function|const)\\s+${Name}\\b`).test(tsx)) err(`falta «export function ${Name}» (export con nombre)`);
const propsRe = new RegExp(`export\\s+(?:interface|type)\\s+${Name}Props\\b`);
const pm = propsRe.exec(tsx);
if (!pm) err(`falta «export interface ${Name}Props»`);
else {
  const start = tsx.indexOf('{', pm.index + pm[0].length);
  let depth = 0, end = start;
  for (let i = start; i < tsx.length; i++) { if (tsx[i] === '{') depth++; else if (tsx[i] === '}' && --depth === 0) { end = i; break; } }
  const body = tsx.slice(start + 1, end);
  const keys = new Map(); depth = 0;
  for (const line of body.split('\n')) {
    if (depth === 0) { const m = line.match(/^\s*(?:readonly\s+)?(['"]?)([\w-]+)\1\??\s*:/); if (m) keys.set(m[2], line); }
    for (const ch of line) { if ('{(['.includes(ch)) depth++; else if ('})]'.includes(ch)) depth--; }
  }
  const names = (c.props ?? []).map((p) => p.name);
  for (const n of names) if (!keys.has(n)) {
    const inherited = /\bextends\b|=\s*(Omit|Pick|React|Component|Html|Button|Anchor)/.test(tsx.slice(pm.index, start)) && /^(aria-|on[A-Z]|children$|type$|disabled$)/.test(n);
    if (inherited && new RegExp(`\\b${n.replace('-', '\\-')}\\b`).test(tsx)) warn(`prop «${n}» no está declarada en ${Name}Props; se hereda del elemento nativo. Declárala explícita para que el tipo refleje el contrato`);
    else err(`la prop «${n}» del contrato no está en ${Name}Props`);
  }
  const allowed = new Set([...names, 'ref']);
  for (const k of keys.keys()) if (!allowed.has(k)) (k === 'className' ? warn : err)(`prop «${k}» en ${Name}Props no existe en el contrato (no añadas props)`);
  for (const [n, vals] of Object.entries(enums)) { const line = keys.get(n); if (line) for (const v of vals) if (!line.includes(`'${v}'`) && !line.includes(`"${v}"`)) err(`${Name}Props.${n} no admite «${v}»`); }
  for (const p of c.props ?? []) {
    const optional = keys.get(p.name)?.includes('?:');
    if (p.required && keys.has(p.name) && optional) err(`«${p.name}» es obligatoria en el contrato y aquí es opcional`);
    if (!p.required && keys.has(p.name) && !optional && p.default !== undefined) warn(`«${p.name}» tiene default en el contrato; márcala opcional (?)`);
    if (p.default !== undefined && p.default !== null && !p.required) {
      const d = String(p.default).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\b${p.name.replace('-', '\\-')}\\s*(?::\\s*[\\w$]+\\s*)?=\\s*['"]?${d}['"]?\\b`).test(tsx)) warn(`no veo el valor por defecto de «${p.name}» (${p.default}) en el componente`);
    }
  }
}

// 3. Partes, ref y estados controlados
for (const [part, def] of Object.entries(c.anatomy ?? {})) {
  if (def.element === 'css') continue;
  if (!new RegExp(`data-part=["'{]+\\s*${part}\\b`).test(tsx)) (def.optional || def.slot ? warn : err)(`falta data-part="${part}"`);
}
if (c.semantics?.refTarget && !/\bref\b/.test(tsx)) warn(`no veo «ref»; debe ir en la parte «${c.semantics.refTarget}»`);
for (const s of c.states?.controlled ?? []) {
  for (const a of String(s.aria ?? '').match(/aria-[a-z-]+/g) ?? []) if (!tsx.includes(a)) err(`estado «${s.name}»: falta ${a} en el tsx`);
  if (/atributo HTML nativo/.test(s.aria ?? '') && !new RegExp(`\\b${s.name}\\b`).test(tsx)) err(`estado «${s.name}»: falta el atributo nativo ${s.name}`);
}

// 4. Reglas de código
if (/:\s*any\b|\bas any\b|<any>/.test(tsx)) err('hay «any» en el tsx');
if (/style=\{\{/.test(tsx)) err('estilos en línea (style={{…}}): usa el CSS Module');
if (/from\s+['"]lucide-react['"]/.test(tsx)) err('import directo de lucide-react: usa los iconos del registry');
if (/\bhooks?\b|useState|useEffect|useRef|useReducer|onClick|onChange/.test(tsx) && !/^\s*['"]use client['"]/m.test(tsx) && /useState|useEffect|useRef|useReducer/.test(tsx)) err('usa hooks pero falta «use client»');

// 5. Atributos data-* usados en el CSS ↔ tsx, y variantes cubiertas
const cssAttrs = new Set([...css.matchAll(/\[data-([a-z-]+)/g)].map((m) => m[1]));
for (const a of cssAttrs) if (a !== 'part' && !new RegExp(`data-${a}\\b`).test(tsx)) err(`el CSS usa [data-${a}] pero el tsx no lo pone`);
for (const [n, vals] of Object.entries(enums)) {
  const used = (c.props.find((p) => p.name === n)?.bindings?.figma?.type === 'VARIANT') || cssAttrs.has(kebab(n));
  if (!used) continue;
  if (!new RegExp(`data-${kebab(n)}\\b`).test(tsx)) { warn(`el tsx no expone data-${kebab(n)} (prop «${n}»)`); continue; }
  for (const v of vals) if (!css.includes(`[data-${kebab(n)}="${v}"]`)) warn(`el CSS no tiene ningún selector para ${n}="${v}"`);
}
for (const b of bools) if (cssAttrs.has(kebab(b)) && !new RegExp(`data-${kebab(b)}\\s*=`).test(tsx)) err(`data-${kebab(b)} debe ponerse en el tsx (data-${kebab(b)}={${b} || undefined})`);

// 6. CSS: solo variables del contrato, nada de valores sueltos
const bound = boundTokens(c);
const allowedVars = new Set();
for (const t of bound) { allowedVars.add(toVarName(t)); allowedVars.add(toVarName(t) + '-letter-spacing'); }
const tokenNames = root ? loadTokenNames(root) : null;
const allowedPrefix = (c.tokens?.policy?.allowed ?? []).map((a) => a.split('.').join('-'));
const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
const used = new Set([...clean.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
for (const v of used) {
  if (v.startsWith('--_')) continue; // variables locales del componente
  if (allowedVars.has(v)) continue;
  const isToken = tokenNames ? [...tokenNames].some((t) => toVarName(t) === v) : true;
  if (!isToken) err(`variable inexistente ${v}`);
  else err(`${v} no está en tokens.bindings del contrato (¿token inventado?)`);
}
if (/#[0-9a-fA-F]{3,8}\b/.test(clean)) err('color hexadecimal suelto en el CSS');
if (/\b(?:rgba?|hsla?|oklch|color-mix)\(/.test(clean)) err('color rgb/hsl suelto en el CSS');
const { px, opacity } = numericValues(c);
for (const m of clean.matchAll(/(?<![\w.-])(\d*\.?\d+)px\b/g)) { const n = Number(m[1]); if (!px.has(n)) err(`valor suelto ${m[0]}: no está en el contrato (layout / tokens.bindings)`); }
for (const m of clean.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = m[1].trim(), bodyCss = m[2];
  for (const o of bodyCss.matchAll(/\bopacity\s*:\s*([\d.]+)/g)) {
    const selNoNot = sel.replace(/:not\([^)]*\)/g, ''); // :hover:not(:disabled) no es una regla disabled
    if (/:disabled|\[aria-disabled|\[data-disabled/.test(selNoNot)) err(`opacity en un selector disabled (${sel.slice(0, 60)}…): disabled va con tokens`);
    else if (!opacity.has(Number(o[1]))) err(`opacity ${o[1]} no está en el contrato`);
  }
}
if (!(/\.root\b/.test(clean)) && !/\.[\w-]+/.test(clean)) warn('el CSS no tiene clases');
const unused = [...bound].filter((t) => !used.has(toVarName(t)) && !used.has(toVarName(t).replace(/-letter-spacing$/, '')));
if (unused.length) warn(`${unused.length} tokens del contrato no aparecen en el CSS${unused.length <= 8 ? ': ' + unused.join(', ') : ` (p. ej. ${unused.slice(0, 5).join(', ')})`}`);

// 7. Lo conocido que queda por decidir
const nr = c.meta?.needsReview ?? [];
if (nr.length) warn(`el contrato tiene ${nr.length} puntos en meta.needsReview: confirma que ninguno afecta a lo que has hecho`);
if (!/TODO\(contract\)/.test(tsx + css) && nr.length) { /* ok */ }

for (const w of warnings) console.log('aviso  ', w);
for (const e of errors) console.log('ERROR  ', e);
console.log(`\n${Name}@${c.version} · ${errors.length} errores, ${warnings.length} avisos`);
process.exit(errors.length ? 1 : 0);
