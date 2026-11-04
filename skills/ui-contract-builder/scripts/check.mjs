#!/usr/bin/env node
// Comprobación mínima, sin dependencias.
// Uso: node check.mjs [carpeta-del-sistema-de-diseño]
//   Sin argumento: la carpeta de este archivo si tiene contracts/; si no, el directorio actual.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ? path.resolve(process.argv[2]) : fs.existsSync(path.join(here, 'contracts')) ? here : process.cwd();
if (!fs.existsSync(path.join(root, 'contracts'))) { console.error(`No hay carpeta contracts/ en ${root}`); process.exit(2); }
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);
const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { err(path.relative(root, p), `JSON inválido (${e.message})`); return null; }
};

// 1. Tokens: lista plana y referencias {a.b.c} que existan
const listJson = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? listJson(path.join(d, e.name)) : e.name.endsWith('.json') ? [path.join(d, e.name)] : []);
const hasTokens = fs.existsSync(path.join(root, 'tokens'));
const tokenFiles = hasTokens ? listJson('tokens') : [];
if (!hasTokens) warnings.push('tokens/: no existe; no se comprueba que los tokens citados existan');
const names = new Set();
const walk = (o, p = []) => {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object') {
      if ('$value' in v) names.add([...p, k].join('.'));
      else walk(v, [...p, k]);
    }
  }
};
const loaded = tokenFiles.map((f) => [f, readJson(path.join(root, f))]).filter(([, j]) => j);
for (const [, j] of loaded) walk(j);
for (const [f, j] of loaded) {
  const refs = (o) => {
    for (const [k, v] of Object.entries(o)) {
      if (k === '$value' && typeof v === 'string' && /^\{.+\}$/.test(v) && !names.has(v.slice(1, -1)))
        err(f, `referencia rota ${v}`);
      else if (v && typeof v === 'object') refs(v);
      else if (typeof v === 'string' && /^\{.+\}$/.test(v) && !names.has(v.slice(1, -1))) err(f, `referencia rota ${v}`);
    }
  };
  refs(j);
}

// 2. Contratos
const dir = path.join(root, 'contracts');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.contract.json'));
const known = new Set(files.map((f) => f.split('.')[0]));
const core = ['id', 'name', 'version', 'status', 'description', 'guidance', 'semantics', 'props', 'states', 'anatomy', 'tokens', 'a11y'];
const strings = (o, out = []) => {
  if (typeof o === 'string') out.push(o);
  else if (o && typeof o === 'object') Object.values(o).forEach((v) => strings(v, out));
  return out;
};

for (const f of files) {
  const c = readJson(path.join(dir, f));
  if (!c) continue;
  if (f.startsWith('_')) continue; // la plantilla solo debe ser JSON válido
  for (const k of core) if (!(k in c)) err(f, `falta el bloque «${k}»`);
  const { anchors, ...rest } = c;
  // marcador = «<texto con espacios>» o cadena que empieza por «<»; no cuenta <button>, <a> ni genéricos de TypeScript
  const pending = (o) => strings(o).some((s) => /^<[^>]+>/.test(s) || /<[^>\s/]*\s[^>/]*>/.test(s));
  if (pending(rest)) err(f, 'quedan placeholders <...> sin rellenar');
  if (pending(anchors ?? {})) warn(f, 'anchors pendientes: pega el enlace de Figma y la ruta de código');
  if (c.name && f.split('.')[0] !== c.name) err(f, `el nombre del archivo debe ser ${c.name}.contract.json`);

  // props: nombres únicos y propiedades de Figma únicas
  const propNames = new Set();
  const figmaProps = new Set();
  const enums = {};
  for (const p of c.props ?? []) {
    if (propNames.has(p.name)) err(f, `prop duplicada «${p.name}»`);
    propNames.add(p.name);
    const fb = p.bindings?.figma;
    const fp = fb?.property;
    const fk = fp && fb.value !== undefined ? `${fp}=${fb.value}` : fp; // varias props pueden compartir un eje si cada una tiene su value
    if (fp) { if (figmaProps.has(fk)) err(f, `propiedad de Figma duplicada «${fk}»`); figmaProps.add(fk); figmaProps.add(fp); }
    const vals = [...String(p.type).matchAll(/'([^']+)'/g)].map((m) => m[1]);
    if (vals.length) enums[p.name] = vals;
  }

  // anatomía: slots completos y refTarget existente
  for (const [part, def] of Object.entries(c.anatomy ?? {})) {
    if (def.slot && !(def.slot.allowedComponents?.length)) err(f, `el slot de «${part}» no declara allowedComponents`);
    if (def.content && !propNames.has(def.content.prop)) err(f, `anatomy.${part}.content apunta a una prop inexistente «${def.content.prop}»`);
    if (def.slot?.figmaProp && ![...figmaProps].includes(def.slot.figmaProp))
      warn(f, `slot «${part}»: figmaProp «${def.slot.figmaProp}» no coincide con ninguna propiedad de Figma de props`);
  }
  if (c.semantics?.refTarget && !(c.semantics.refTarget in (c.anatomy ?? {})))
    err(f, `semantics.refTarget «${c.semantics.refTarget}» no es una parte de anatomy`);

  // guidance
  for (const d of c.guidance?.donts ?? []) if (!d.case || !d.useInstead) err(f, 'cada don\'t necesita case y useInstead');
  for (const r of c.guidance?.related ?? []) if (!known.has(r.component)) warn(f, `related: «${r.component}» aún no tiene contrato`);

  // tokens: existen, dentro de policy, expandiendo {prop}
  const { allowed = [], forbidden = [] } = c.tokens?.policy ?? {};
  const under = (s, list) => list.some((a) => s === a || s.startsWith(a + '.'));
  const scales = c.tokens?.scales ?? {};
  // expande {prop} (valores del enum) y {prop.clave} (tokens.scales[valor][clave]); admite varias por cadena
  const expand = (s) => {
    let list = [s];
    for (const m of [...s.matchAll(/\{(\w+)(?:\.(\w+))?\}/g)]) {
      const [ph, prop, key] = m;
      if (!enums[prop]) { err(f, `placeholder ${ph} sin enum en props`); return []; }
      list = list.flatMap((cur) => enums[prop].flatMap((v) => {
        if (!key) return [cur.replace(ph, v)];
        const sc = scales[v];
        if (!sc || !(key in sc)) { err(f, `tokens.scales.${v}.${key} no existe (usado en ${s})`); return []; }
        return sc[key] === null ? [] : [cur.replace(ph, sc[key])];
      }));
    }
    return list;
  };
  const checkTok = (t) => {
    if (hasTokens && !names.has(t)) err(f, `token inexistente «${t}»`);
    if (under(t, forbidden)) err(f, `token prohibido por policy «${t}»`);
    else if (!under(t, allowed)) err(f, `token fuera de policy.allowed «${t}»`);
  };
  for (const s of strings(c.tokens?.bindings ?? {})) for (const t of expand(s)) checkTok(t);
}

// 3. Iconos: registry válido, por librería (Lucide en icons/, Phosphor en icons/phosphor/)
const checkIcons = (dir, lib) => {
  const regRel = `${dir}/registry.json`, catRel = `${dir}/catalog.json`;
  const regPath = path.join(root, regRel);
  if (!fs.existsSync(regPath)) return;
  const reg = readJson(regPath);
  const ns = (reg?.icons ?? []).map((i) => i.name);
  for (const n of ns) if (!/^[A-Z][A-Za-z0-9]*$/.test(n)) err(regRel, `nombre no válido «${n}» (PascalCase, como en ${reg.library})`);
  if (new Set(ns).size !== ns.length) err(regRel, 'nombres duplicados');
  for (const i of reg?.icons ?? []) if (!i.use) err(regRel, `«${i.name}» sin campo use`);

  // 4. Catálogo completo (opcional): coherente, y el registry es un subconjunto suyo
  const catPath = path.join(root, catRel);
  if (fs.existsSync(catPath)) {
    const cat = readJson(catPath);
    const ci = cat?.icons ?? [];
    const kebab = ci.map((i) => i.name);
    if (new Set(kebab).size !== kebab.length) err(catRel, 'nombres duplicados');
    if (cat.count !== ci.length) err(catRel, `count (${cat.count}) no coincide con los iconos (${ci.length})`);
    const cats = new Set((cat.categories ?? []).map((c) => c.id));
    for (const i of ci) for (const c of i.categories ?? []) if (!cats.has(c)) err(catRel, `«${i.name}»: categoría sin definir «${c}»`);
    for (const w of reg?.weights ?? []) if (!(cat.weights ?? []).includes(w)) err(regRel, `peso «${w}» no existe en ${catRel}`);
    const pas = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
    const canon = new Set(ci.map((i) => i.pascal));
    const alias = new Map(ci.flatMap((i) => (i.aliases ?? []).map((a) => [pas(a), i.pascal])));
    for (const n of ns) {
      if (canon.has(n)) continue;
      if (alias.has(n)) warnings.push(`${regRel}: «${n}» es un alias antiguo de ${lib}; el nombre actual es «${alias.get(n)}»`);
      else err(regRel, `«${n}» no existe en ${catRel}`);
    }
  }
};
checkIcons('icons', 'Lucide');
checkIcons('icons/phosphor', 'Phosphor');

for (const w of warnings) console.log('aviso  ', w);
for (const e of errors) console.log('ERROR  ', e);
console.log(`\n${files.length} contratos, ${names.size} tokens · ${errors.length} errores, ${warnings.length} avisos`);
process.exit(errors.length ? 1 : 0);
