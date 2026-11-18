#!/usr/bin/env node
// Comprueba que un componente (tsx + module.css) cumple su contrato.
//   node conformance.mjs <carpeta-del-componente> [--contract <ruta>] [--ds <raíz>]
// La carpeta contiene <id>.tsx, <id>.module.css y <Nombre>.contract.json (copia del contrato).
// Sale con código 1 si hay errores, 2 si no puede ejecutarse. Los avisos no fallan.
//
// Lee el tsx con el compilador de TypeScript (el del proyecto: cualquier proyecto React + TS lo tiene),
// no con expresiones regulares: tipos exactos, defaults, data-part y ref sobre el JSX real, sin contar comentarios.
// El CSS se comprueba por lista blanca: todo valor es var(--token del contrato) o un número del contrato.
// Una declaración en una línea con «TODO(contract): motivo» pasa como aviso, nunca en silencio.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { kebab, readJson, findRoot, loadTokenNames, toVarName, propInfo, boundTokens, numericValues } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const dir = args.find((a) => !a.startsWith('--') && a !== opt('--contract') && a !== opt('--ds'));
if (!dir || !fs.existsSync(dir)) { console.error('Uso: node conformance.mjs <carpeta-del-componente> [--contract ruta] [--ds raíz]'); process.exit(2); }

// TypeScript del proyecto: se busca subiendo desde la carpeta del componente y desde el directorio actual
function loadTs() {
  for (const base of [path.resolve(dir), process.cwd()]) {
    let d = base;
    for (;;) {
      try { return createRequire(path.join(d, 'noop.js'))('typescript'); } catch { /* sigue subiendo */ }
      const up = path.dirname(d); if (up === d) break; d = up;
    }
  }
  return null;
}
const ts = loadTs();
if (!ts) { console.error('No encuentro «typescript». Ejecuta el verificador desde el proyecto React (npm i -D typescript).'); process.exit(2); }

const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const files = fs.readdirSync(dir);
const copyName = files.find((f) => f.endsWith('.contract.json'));
if (!copyName) { console.error(`No hay *.contract.json en ${dir}: copia el contrato junto al componente.`); process.exit(2); }
const c = readJson(path.join(dir, copyName));
const root = findRoot(opt('--ds'));
const sourcePath = opt('--contract') ?? (root ? path.join(root, 'contracts', copyName) : null);
const id = c.id ?? kebab(c.name);
const tsxName = files.find((f) => f === `${id}.tsx`) ?? files.find((f) => f.endsWith('.tsx') && !/\.(test|stories)\.tsx$/.test(f));
const cssName = files.find((f) => f === `${id}.module.css`) ?? files.find((f) => f.endsWith('.module.css'));
if (!tsxName) err(`falta ${id}.tsx`);
if (!cssName) err(`falta ${id}.module.css`);
if (!tsxName || !cssName) { for (const e of errors) console.log('ERROR  ', e); process.exit(1); }
const tsx = fs.readFileSync(path.join(dir, tsxName), 'utf8');
const css = fs.readFileSync(path.join(dir, cssName), 'utf8');
const Name = c.name;
const { enums } = propInfo(c);
const parts = Object.entries(c.anatomy ?? {}).filter(([, d]) => d.element !== 'css').map(([k]) => k);

// ─── 1. Copia idéntica y versión anotada ─────────────────────────────────────
if (sourcePath && fs.existsSync(sourcePath)) {
  if (JSON.stringify(readJson(sourcePath)) !== JSON.stringify(c)) err(`${copyName} no es idéntico a ${path.relative(process.cwd(), sourcePath)}: vuelve a copiarlo (o sube la versión en el contrato)`);
} else err('no encuentro el contrato fuente para comparar la copia (usa --contract o --ds)');
const header = tsx.match(/@contract\s+(\w+)@(\d+\.\d+\.\d+)/);
if (!header) err(`falta el comentario «@contract ${Name}@${c.version}» al principio del tsx`);
else if (header[1] !== Name || header[2] !== c.version) err(`el tsx dice @contract ${header[1]}@${header[2]}; el contrato es ${Name}@${c.version}`);

// ─── 2. TSX con el compilador ────────────────────────────────────────────────
const sf = ts.createSourceFile(tsxName, tsx, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const K = ts.SyntaxKind;
const nodes = [];
(function visit(n) { nodes.push(n); ts.forEachChild(n, visit); })(sf);
const text = (n) => n.getText(sf);
const isExported = (n) => !!n.modifiers?.some((m) => m.kind === K.ExportKeyword);
const keyName = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteral(n)) ? n.text : n ? text(n) : undefined);

// Forma canónica de un tipo: uniones sin orden, comillas simples, sin espacios, sin «React.», sin undefined si es opcional
function typeKey(typeText, optional) {
  typeText = String(typeText).replace(/(?<=\w)\s+\([A-Z][^()]*\)\s*$/, ''); // «ReactNode (RadioGroup.Item)»: la nota entre paréntesis no es tipo
  const f = ts.createSourceFile('t.ts', `type __T = ${typeText};`, ts.ScriptTarget.Latest, true);
  const alias = f.statements[0];
  if (!alias || !ts.isTypeAliasDeclaration(alias)) return String(typeText).replace(/\s+/g, '');
  const norm = (n) => {
    if (ts.isParenthesizedTypeNode(n)) return norm(n.type);
    if (ts.isUnionTypeNode(n)) {
      let ms = n.types.map(norm);
      if (optional) ms = ms.filter((m) => m !== 'undefined');
      ms = [...new Set(ms)].sort();
      if (ms.length === 2 && ms.includes('false') && ms.includes('true')) return 'boolean';
      return ms.join('|');
    }
    return n.getText(f).replace(/\breact\./gi, '').replace(/"/g, "'").replace(/\s+/g, '').replace(/;}/g, '}');
  };
  return norm(alias.type);
}

// Export del componente
const compFn = nodes.find((n) =>
  (ts.isFunctionDeclaration(n) && n.name?.text === Name) ||
  (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === Name));
const compExported = compFn && (ts.isFunctionDeclaration(compFn) ? isExported(compFn) : isExported(compFn.parent.parent));
if (!compFn || !compExported) err(`falta «export function ${Name}» (export con nombre)`);

// Tipo de props
// API compuesta (composition.codeParts con «Nombre.Parte»): las props del contrato son las de Nombre.Root,
// tipadas como <Nombre>Props o <Nombre>RootProps, y Nombre se exporta como objeto { Root, Item, … }.
const compound = (c.composition?.codeParts ?? []).some((p) => String(p.name ?? p).startsWith(`${Name}.`));
const propsNames = compound ? [`${Name}Props`, `${Name}RootProps`] : [`${Name}Props`];
const propsDecl = nodes.find((n) => (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) && propsNames.includes(n.name.text));
if (compound && compFn && ts.isVariableDeclaration(compFn) && compFn.initializer) {
  const init = compFn.initializer;
  const keys = ts.isObjectLiteralExpression(init) ? init.properties.map((p) => keyName(p.name))
    : ts.isCallExpression(init) && /Object\.assign/.test(text(init.expression)) ? init.arguments.flatMap((a) => (ts.isObjectLiteralExpression(a) ? a.properties.map((p) => keyName(p.name)) : []))
    : [];
  for (const part of c.composition.codeParts.map((p) => String(p.name ?? p)).filter((n) => n.startsWith(`${Name}.`)))
    if (!keys.includes(part.slice(Name.length + 1))) err(`composition.codeParts: falta ${part} en el objeto exportado ${Name}`);
}
const members = new Map(); // nombre → { optional, type }
if (!propsDecl || !isExported(propsDecl)) err(`falta «export interface ${Name}Props»`);
else {
  let list = [];
  if (ts.isInterfaceDeclaration(propsDecl)) {
    list = propsDecl.members;
    if (propsDecl.heritageClauses?.length) err(`${Name}Props hereda (${propsDecl.heritageClauses.map(text).join(' ')}): declara las props del contrato explícitas; heredar mete props que el contrato no tiene`);
  } else if (ts.isTypeLiteralNode(propsDecl.type)) list = propsDecl.type.members;
  else err(`${Name}Props debe ser un objeto literal ({ … }), no ${text(propsDecl.type).slice(0, 60)}`);
  for (const m of list) {
    if (!ts.isPropertySignature(m)) { err(`${Name}Props: miembro no admitido «${text(m).slice(0, 50)}»`); continue; }
    members.set(keyName(m.name), { optional: !!m.questionToken, type: m.type ? text(m.type) : 'any' });
  }
  const names = (c.props ?? []).map((p) => p.name);
  for (const p of c.props ?? []) {
    const m = members.get(p.name);
    if (!m) { err(`la prop «${p.name}» del contrato no está en ${Name}Props`); continue; }
    if (p.required && m.optional) err(`«${p.name}» es obligatoria en el contrato y aquí es opcional`);
    if (!p.required && !m.optional) err(`«${p.name}» no es obligatoria en el contrato: márcala opcional (?)`);
    const want = typeKey(p.type, true), got = typeKey(m.type, true);
    if (want !== got) err(`${Name}Props.${p.name}: el tipo es «${m.type}» y el contrato dice «${p.type}»`);
  }
  for (const k of members.keys()) {
    if (names.includes(k)) continue;
    if (k === 'ref' && c.semantics?.refTarget) continue;
    err(`prop «${k}» en ${Name}Props no existe en el contrato (no añadas props; si hace falta, cambia primero el contrato)`);
  }
}

// Defaults en la desestructuración
// La función que recibe las props del contrato: la que tipa su primer parámetro con el tipo de props
const typedWith = (fn) => propsDecl && fn.parameters?.[0]?.type && text(fn.parameters[0].type) === propsDecl.name.text;
const fnNode = nodes.find((n) => (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && typedWith(n))
  ?? (compFn && (ts.isFunctionDeclaration(compFn) ? compFn : nodes.find((n) => (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && n.pos >= compFn.pos && n.end <= compFn.end)));
if (propsDecl && !nodes.some((n) => (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && typedWith(n)))
  err(`ninguna función recibe ${propsDecl.name.text}: tipa el parámetro del componente con él`);
const param = fnNode?.parameters?.[0];
const defaults = new Map();
if (fnNode && (c.props ?? []).length) {
  if (!param || !ts.isObjectBindingPattern(param.name)) err(`desestructura las props en la firma de ${Name} ({ variant = …, … }) para que los defaults se vean`);
  else for (const el of param.name.elements) defaults.set(keyName(el.propertyName ?? el.name), el.initializer);
}
const literal = (n) => {
  if (!n) return undefined;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (n.kind === K.TrueKeyword) return true;
  if (n.kind === K.FalseKeyword) return false;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  return text(n);
};
if (param && ts.isObjectBindingPattern(param.name)) for (const p of c.props ?? []) {
  const has = p.default !== undefined && p.default !== null;
  const init = defaults.get(p.name);
  if (has && !init) err(`«${p.name}»: falta el default ${JSON.stringify(p.default)} en la desestructuración`);
  else if (has && literal(init) !== p.default && String(literal(init)) !== String(p.default)) err(`«${p.name}»: el default es ${text(init)} y el contrato dice ${JSON.stringify(p.default)}`);
  else if (!has && init) err(`«${p.name}»: el contrato no tiene default y el código pone ${text(init)}`);
}

// JSX: elementos, atributos, data-part, ref
const jsx = nodes.filter((n) => ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)).map((n) => {
  const attrs = new Map();
  for (const a of n.attributes.properties) if (ts.isJsxAttribute(a)) {
    const init = a.initializer;
    const value = !init ? true : ts.isStringLiteral(init) ? init.text : init.expression && ts.isStringLiteral(init.expression) ? init.expression.text : init.expression ? text(init.expression) : true;
    attrs.set(text(a.name), value);
  }
  return { tag: text(n.tagName), attrs };
});
const attrNames = new Set(jsx.flatMap((e) => [...e.attrs.keys()]));
const partsInJsx = jsx.map((e) => e.attrs.get('data-part')).filter((v) => typeof v === 'string');
// Una parte que es un elemento HTML lleva su data-part sí o sí. Si es un svg u otro componente
// (Heading, AlertDialog.Cancel…), puede que el data-part lo ponga ese componente: aviso.
for (const p of parts) if (!partsInJsx.includes(p)) {
  const el = String(c.anatomy[p].element ?? '');
  (/^[a-z][a-z0-9]*$/.test(el) && el !== 'svg' ? err : warn)(`falta data-part="${p}" en el JSX`);
}
for (const p of new Set(partsInJsx)) if (!parts.includes(p) && c.anatomy?.[p]?.element !== 'css') err(`data-part="${p}" no es una parte de anatomy`);
const refTarget = c.semantics?.refTarget;
if (refTarget) {
  const el = jsx.find((e) => e.attrs.get('data-part') === refTarget);
  if (!el?.attrs.has('ref')) err(`el ref debe ir en la parte «${refTarget}» (semantics.refTarget)`);
}
for (const e of jsx) if (e.attrs.has('ref') && refTarget && e.attrs.get('data-part') !== refTarget) err(`hay un ref en «${e.attrs.get('data-part') ?? e.tag}»; solo va en «${refTarget}»`);
if (c.semantics?.element && !jsx.some((e) => e.tag === c.semantics.element)) {
  // si pinta otro componente (p. ej. el glifo de icons.ts), el elemento lo pone ese componente
  (jsx.some((e) => /^[A-Z]/.test(e.tag)) ? warn : err)(`semantics.element es <${c.semantics.element}> y no aparece en el JSX`);
}
if (/^[a-z]+$/.test(c.semantics?.role ?? '') && !jsx.some((e) => e.attrs.get('role') === c.semantics.role)) err(`falta role="${c.semantics.role}" (semantics.role)`);

// Estados controlados: atributos reales del JSX
for (const s of c.states?.controlled ?? []) {
  for (const a of String(s.aria ?? '').match(/aria-[a-z-]+/g) ?? []) if (!attrNames.has(a)) err(`estado «${s.name}»: falta el atributo ${a} en el JSX`);
  if (/atributo HTML nativo/.test(s.aria ?? '') && !attrNames.has(s.name)) err(`estado «${s.name}»: falta el atributo nativo ${s.name} en el JSX`);
}

// Reglas de código
if (nodes.some((n) => n.kind === K.AnyKeyword)) err('hay «any» en el tsx');
if (attrNames.has('style')) err('estilos en línea (style={…}): usa el CSS Module');
if (attrNames.has('data-state')) err('data-state en el JSX: los estados se estilan con atributos ARIA o nativos');
for (const n of nodes) if (ts.isImportDeclaration(n)) {
  const from = n.moduleSpecifier.text;
  if (from === 'lucide-react' || /^@phosphor-icons\/react/.test(from)) err(`import directo de ${from}: usa los iconos del registry (icons.ts) a través de Icon`);
}
const hooks = nodes.filter((n) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && /^use(State|Effect|LayoutEffect|Ref|Reducer|Context|Transition|Optimistic|ActionState)$/.test(n.expression.text));
const useClient = sf.statements[0] && ts.isExpressionStatement(sf.statements[0]) && ts.isStringLiteral(sf.statements[0].expression) && sf.statements[0].expression.text === 'use client';
if (hooks.length && !useClient) err('usa hooks de estado o efecto pero falta «use client» al principio del archivo');

// Elementos nativos que el contrato prohíbe dentro
for (const f of c.composition?.forbiddenChildren ?? []) {
  const tag = typeof f === 'string' ? f : f.component ?? f.name;
  if (tag && jsx.some((e) => e.tag === tag)) err(`composition.forbiddenChildren: <${tag}> no puede ir dentro de ${Name}`);
}

// ─── 3. CSS por lista blanca ─────────────────────────────────────────────────
const todoLines = new Set(css.split('\n').map((l, i) => (/TODO\(contract\)/.test(l) ? i : -1)).filter((i) => i >= 0));
const clean = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')); // mismas líneas, sin comentarios
const lineAt = (idx) => clean.slice(0, idx).split('\n').length - 1;
const bound = boundTokens(c);
const allowedVars = new Set();
for (const t of bound) { allowedVars.add(toVarName(t)); allowedVars.add(toVarName(t) + '-letter-spacing'); }
const tokenNames = root ? loadTokenNames(root) : null;
const tokenVars = tokenNames ? new Set([...tokenNames].map(toVarName)) : null;
const { px, opacity } = numericValues(c);
const localVars = new Set([...clean.matchAll(/(--_[\w-]+)\s*:/g)].map((m) => m[1]));
const usedVars = new Set();
const NAMED = new Set('red blue green black white gray grey orange yellow purple pink brown cyan magenta navy teal lime olive maroon silver gold indigo violet coral salmon tomato crimson aqua fuchsia beige ivory khaki lavender plum orchid tan turquoise wheat chocolate firebrick skyblue steelblue royalblue slategray lightgray darkgray lightgrey darkgrey darkred darkblue darkgreen lightblue lightgreen hotpink deeppink'.split(' '));
const isDisabledSel = (sel) => /:disabled|\[aria-disabled|\[data-disabled/.test(sel.replace(/:not\([^)]*\)/g, ''));
let hasFocusVisible = false;

for (const blk of clean.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const sel = blk[1].trim();
  if (/^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(sel) === false && /:focus-visible/.test(sel)) hasFocusVisible = true;
  if (/\[data-state/.test(sel)) err(`selector con [data-state] (${sel.slice(0, 50)}): usa atributos ARIA o nativos`);
  const bodyStart = blk.index + blk[1].length + 1;
  let offset = 0;
  for (const raw of blk[2].split(';')) {
    const at = bodyStart + offset; offset += raw.length + 1;
    const m = raw.match(/^\s*([-\w]+)\s*:\s*([\s\S]+?)\s*$/);
    if (!m) continue;
    const [, prop, value] = m;
    const line = lineAt(at + raw.search(/\S/));
    const where = `${cssName}:${line + 1} «${prop}: ${value.slice(0, 50)}»`;
    const bad = [];
    // variables: deben existir y estar en el contrato
    for (const v of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const name = v[1]; usedVars.add(name);
      if (name.startsWith('--_')) { if (!localVars.has(name)) bad.push(`variable local ${name} sin definir`); continue; }
      if (allowedVars.has(name)) continue;
      if (tokenVars && !tokenVars.has(name)) bad.push(`variable inexistente ${name}`);
      else bad.push(`${name} no está en tokens.bindings del contrato`);
    }
    const rest = value.replace(/var\([^()]*(\([^()]*\))?[^()]*\)/g, ' ');
    if (/!important/.test(rest)) bad.push('!important');
    if (/#[0-9a-f]{3,8}\b/i.test(rest)) bad.push('color hexadecimal');
    if (/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\(/i.test(rest)) bad.push('función de color');
    for (const w of rest.toLowerCase().match(/[a-z]+/g) ?? []) if (NAMED.has(w)) bad.push(`color con nombre «${w}»`);
    for (const n of rest.matchAll(/(?<![\w-])(-?\d*\.?\d+)([a-z%]*)/gi)) {
      const num = Math.abs(Number(n[1])), unit = n[2].toLowerCase();
      if (unit === 'px') { if (!px.has(num)) bad.push(`${n[0]} no está en el contrato`); }
      else if (['ms', 's'].includes(unit)) { if (num !== 0) bad.push(`duración ${n[0]} sin token de motion en el contrato`); }
      else if (unit === '%') { if (![0, 50, 100].includes(num)) bad.push(`${n[0]} suelto`); }
      else if (['deg', 'turn', 'fr', 'x', ''].includes(unit)) {
        if (unit === '' && /^(font-weight|line-height|z-index|letter-spacing)$/.test(prop) && num !== 0) bad.push(`${prop} ${n[0]}: usa un token`);
      } else bad.push(`unidad suelta ${n[0]} (solo tokens o px del contrato)`);
    }
    if (prop === 'opacity') {
      if (isDisabledSel(sel)) bad.push('opacity en disabled: disabled va con tokens');
      else for (const n of rest.matchAll(/\d*\.?\d+/g)) if (!opacity.has(Number(n[0])) && Number(n[0]) !== 1) bad.push(`opacity ${n[0]} no está en el contrato`);
    }
    if (prop === 'filter' && isDisabledSel(sel)) bad.push('filter en disabled: disabled va con tokens');
    if (!bad.length) continue;
    if (todoLines.has(line)) warn(`${where}: ${bad.join('; ')} (marcado TODO(contract))`);
    else err(`${where}: ${bad.join('; ')}`);
  }
}

// atributos del CSS ↔ JSX
const cssAttrs = new Set([...clean.matchAll(/\[(data-[a-z-]+|aria-[a-z-]+)/g)].map((m) => m[1]));
for (const a of cssAttrs) if (a !== 'data-part' && !attrNames.has(a)) err(`el CSS usa [${a}] pero el JSX no lo pone`);
const controlledNames = new Set((c.states?.controlled ?? []).map((s) => s.name));
for (const [n, vals] of Object.entries(enums)) {
  if (controlledNames.has(n)) continue; // un estado controlado se estila con su atributo ARIA, no con data-*
  const attr = `data-${kebab(n)}`;
  const isVariant = c.props.find((p) => p.name === n)?.bindings?.figma?.type === 'VARIANT';
  if (!isVariant && !cssAttrs.has(attr)) continue;
  if (!attrNames.has(attr)) { err(`el JSX no expone ${attr} (prop «${n}» es variante de Figma)`); continue; }
  for (const v of vals) if (!clean.includes(`[${attr}="${v}"]`)) warn(`el CSS no tiene ningún selector para ${n}="${v}"`);
}

// foco visible si el componente es interactivo
const interactive = (c.a11y?.keyboard?.length ?? 0) > 0 || jsx.some((e) => ['button', 'a', 'input', 'select', 'textarea'].includes(e.tag) || e.attrs.has('tabIndex'));
if (interactive && !hasFocusVisible) err('componente interactivo sin regla :focus-visible (a11y: foco visible)');
if (/outline\s*:\s*(none|0)\b/.test(clean) && !hasFocusVisible) err('outline: none sin :focus-visible que lo sustituya');

// tokens del contrato que no se usan: el contrato no está implementado entero
const unused = [...bound].filter((t) => !usedVars.has(toVarName(t)) && !usedVars.has(toVarName(t) + '-letter-spacing'));
if (unused.length) err(`${unused.length} tokens de tokens.bindings no aparecen en el CSS${unused.length <= 8 ? ': ' + unused.join(', ') : ` (p. ej. ${unused.slice(0, 5).join(', ')})`}`);

// ─── 4. Lo que queda por decidir ─────────────────────────────────────────────
const nr = c.meta?.needsReview ?? [];
const todos = (tsx + css).match(/TODO\(contract\)/g)?.length ?? 0;
if (nr.length) warn(`el contrato tiene ${nr.length} puntos en meta.needsReview y el código ${todos} TODO(contract): confirma que ninguno se ha rellenado con suposiciones`);

for (const w of warnings) console.log('aviso  ', w);
for (const e of errors) console.log('ERROR  ', e);
console.log(`\n${Name}@${c.version} · ${errors.length} errores, ${warnings.length} avisos`);
process.exit(errors.length ? 1 : 0);
