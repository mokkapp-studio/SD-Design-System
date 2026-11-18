#!/usr/bin/env node
// Instala el sistema de diseño (submódulo) en un proyecto Next.js. Se puede repetir: no duplica nada.
//   node design-system/skills/ds-install/scripts/install.mjs [opciones]
//
//   --ds <carpeta>          dónde está el submódulo (por defecto: design-system)
//   --tokens import|copy    import (por defecto): @import de tokens.css; se actualiza solo con el submódulo.
//                           copy: pega las variables dentro de globals.css (:root y dark) entre marcas;
//                           para refrescarlas, vuelve a ejecutar (npm run ds:sync).
//   --icons phosphor|lucide librería de iconos (por defecto: phosphor)
//   --only <lista>          solo estos pasos: tokens,icons,theme,scripts,config,rules,skills
//   --no-install            no ejecuta npm install (solo escribe archivos)
//   --dry-run               dice qué haría, sin escribir nada
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const flag = (n) => args.includes(n);
const P = process.cwd();
const DS = opt('--ds', 'design-system');
const dsAbs = path.join(P, DS);
const tokensMode = opt('--tokens', 'import');
const iconLib = opt('--icons', 'phosphor');
const only = opt('--only') ? new Set(opt('--only').split(',')) : null;
const dry = flag('--dry-run');
const step = (s) => !only || only.has(s);

const done = [], skipped = [], warnings = [];
const rel = (p) => path.relative(P, p) || '.';
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const write = (p, s, what) => {
  if (read(p) === s) { skipped.push(`${rel(p)}: ya estaba (${what})`); return; }
  if (!dry) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }
  done.push(`${rel(p)}: ${what}`);
};
const fail = (m) => { console.error(`✖ ${m}`); process.exit(1); };

// 0. Comprobaciones
const pkgPath = path.join(P, 'package.json');
const pkg = JSON.parse(read(pkgPath) ?? 'null');
if (!pkg) fail('No hay package.json: ejecuta esto en la raíz del proyecto Next.js.');
if (!pkg.dependencies?.next && !pkg.devDependencies?.next) warnings.push('package.json no tiene «next»: el script está pensado para Next.js (App Router).');
if (!fs.existsSync(path.join(dsAbs, 'contracts', 'component.schema.json'))) fail(`No encuentro el sistema en ${DS}/. Añádelo antes: git submodule add <url> ${DS}`);
if (!['import', 'copy'].includes(tokensMode)) fail('--tokens debe ser import o copy');
if (!['phosphor', 'lucide'].includes(iconLib)) fail('--icons debe ser phosphor o lucide');
const appDir = ['src/app', 'app'].map((d) => path.join(P, d)).find((d) => fs.existsSync(d));
if (!appDir) fail('No encuentro src/app ni app: ¿es un proyecto con App Router?');
const srcBase = appDir.endsWith(path.join('src', 'app')) ? path.join(P, 'src') : P;
const tokensCss = path.join(dsAbs, 'tokens', 'tokens.css');
if (!fs.existsSync(tokensCss)) fail(`Falta ${DS}/tokens/tokens.css (en el sistema: npm run tokens:build)`);

// 1. Tokens en globals.css
if (step('tokens')) {
  const g = path.join(appDir, 'globals.css');
  let css = read(g) ?? '';
  const importLine = `@import '${path.relative(appDir, tokensCss).split(path.sep).join('/')}';`;
  const START = '/* @ds-tokens:start — GENERADO por ds-install desde el sistema de diseño. No editar: npm run ds:sync */';
  const END = '/* @ds-tokens:end */';
  const base = `\nbody {\n  margin: 0;\n  background: var(--tokens-colors-page-background);\n  color: var(--tokens-colors-text);\n}\n`;
  // La plantilla de create-next-app trae colores hex y su propio modo oscuro: se sustituye entera.
  if (/--background:\s*#fff|prefers-color-scheme:\s*dark/.test(css) && !css.includes('@ds-tokens') && !css.includes(importLine)) {
    warnings.push(`${rel(g)}: tenía la plantilla de create-next-app (hex y modo oscuro propio); se ha sustituido`);
    css = base;
  }
  css = css.replace(/\/\* @ds-tokens:start[\s\S]*?@ds-tokens:end \*\/\n?/, '').replace(new RegExp(`^${importLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`, 'm'), '');
  const block = tokensMode === 'import'
    ? `${importLine}\n`
    : `${START}\n${read(tokensCss).replace(/^\/\*[\s\S]*?\*\/\s*/, '')}\n${END}\n`;
  write(g, block + css.replace(/^\n+/, '\n'), tokensMode === 'import' ? 'importa tokens.css (variables en :root y [data-theme="dark"])' : 'variables de tokens.css copiadas en :root y [data-theme="dark"]');
  const loose = (css.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
  if (loose) warnings.push(`${rel(g)}: quedan ${loose} colores hex fuera de los tokens; cámbialos por var(--…)`);
  for (const f of fs.readdirSync(appDir).filter((f) => f.endsWith('.module.css'))) {
    const n = (read(path.join(appDir, f)).match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
    if (n) warnings.push(`${rel(path.join(appDir, f))}: ${n} colores hex (¿plantilla de create-next-app?). Bórralo o pásalo a tokens`);
  }
}

// 2. Tema en <html>
if (step('theme')) {
  const layout = ['layout.tsx', 'layout.jsx'].map((f) => path.join(appDir, f)).find((f) => fs.existsSync(f));
  const src = layout && read(layout);
  if (!src) warnings.push('No encuentro app/layout.tsx: pon data-theme="light" en <html> a mano');
  else if (/<html[^>]*data-theme=/.test(src)) skipped.push(`${rel(layout)}: ya tenía data-theme`);
  else write(layout, src.replace(/<html(\s|>)/, '<html data-theme="light"$1'), 'data-theme="light" en <html> (cámbialo a "dark" para el modo oscuro)');
}

// 3. Iconos
const iconsOut = path.join(srcBase, 'components', 'icon', 'icons.ts');
const iconsCmd = `node ${DS}/scripts/build-${iconLib}-icons.mjs ${rel(iconsOut)}`;
if (step('icons')) {
  const reg = JSON.parse(read(path.join(dsAbs, 'icons', iconLib, 'registry.json')));
  const has = pkg.dependencies?.[reg.library];
  if (!has && !flag('--no-install') && !dry) { execSync(`npm install ${reg.library}`, { stdio: 'inherit', cwd: P }); done.push(`npm install ${reg.library}`); }
  else if (!has) warnings.push(`Falta instalar ${reg.library} (npm install ${reg.library})`);
  const before = read(iconsOut);
  if (!dry) execSync(iconsCmd, { stdio: 'pipe', cwd: P });
  if (!dry && read(iconsOut) === before) skipped.push(`${rel(iconsOut)}: ya estaba al día`);
  else done.push(`${rel(iconsOut)}: ${reg.icons.length} iconos de ${reg.library} (registry del sistema)`);
}

// 4. Scripts de package.json
if (step('scripts')) {
  const fresh = JSON.parse(read(pkgPath));
  const want = {
    'ds:check': `node ${DS}/check.mjs ${DS}`,
    'ds:conformance': `node ${DS}/skills/contract-to-component/scripts/conformance-all.mjs ${rel(path.join(srcBase, 'components'))} --ds ${DS}`,
    'ds:icons': iconsCmd,
    'ds:sync': `git submodule update --remote ${DS} && node ${DS}/skills/ds-install/scripts/install.mjs --ds ${DS} --tokens ${tokensMode} --icons ${iconLib} --only tokens,icons --no-install`,
  };
  fresh.scripts = { ...fresh.scripts, ...want };
  write(pkgPath, JSON.stringify(fresh, null, 2) + '\n', 'scripts ds:check, ds:conformance, ds:icons, ds:sync');
}

// 5. TypeScript y ESLint no revisan el submódulo
if (step('config')) {
  const tsPath = path.join(P, 'tsconfig.json');
  const tsSrc = read(tsPath);
  if (tsSrc) {
    try {
      const ts = JSON.parse(tsSrc);
      ts.exclude = [...new Set([...(ts.exclude ?? ['node_modules']), DS])];
      write(tsPath, JSON.stringify(ts, null, 2) + '\n', `exclude ${DS}`);
    } catch { warnings.push(`tsconfig.json no es JSON puro: añade "${DS}" a "exclude" a mano`); }
  }
  const esPath = path.join(P, 'eslint.config.mjs');
  const es = read(esPath);
  if (es && !es.includes(`"${DS}/**"`) && !es.includes(`'${DS}/**'`)) {
    if (/globalIgnores\(\[/.test(es)) write(esPath, es.replace(/globalIgnores\(\[/, `globalIgnores([\n    "${DS}/**",`), `ESLint ignora ${DS}/`);
    else warnings.push(`eslint.config.mjs: añade "${DS}/**" a los ignores a mano`);
  } else if (es) skipped.push(`${rel(esPath)}: ya ignoraba ${DS}/`);
}

// 6. Reglas para la IA
if (step('rules')) {
  const agents = path.join(P, 'AGENTS.md');
  const ours = read(path.join(dsAbs, 'AGENTS.nextjs.md'));
  const S = '<!-- BEGIN:design-system-rules (ds-install) -->', E = '<!-- END:design-system-rules -->';
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const current = (read(agents) ?? '').replace(new RegExp(`\\n*${esc(S)}[\\s\\S]*?${esc(E)}\\n?`, 'g'), '');
  write(agents, `${current.trimEnd()}\n\n${S}\n${ours.trim()}\n${E}\n`.replace(/^\n+/, ''), 'reglas del sistema añadidas (sin tocar las de Next.js)');
  const claude = path.join(P, 'CLAUDE.md');
  const c = read(claude) ?? '';
  if (!c.includes('@AGENTS.md')) write(claude, `@AGENTS.md\n${c}`, 'carga AGENTS.md');
}

// 7. Skills enlazadas al submódulo
if (step('skills')) {
  for (const s of ['contract-to-component', 'ds-install']) {
    const link = path.join(P, '.claude', 'skills', s);
    if (fs.existsSync(link)) { skipped.push(`${rel(link)}: ya enlazada`); continue; }
    if (!dry) { fs.mkdirSync(path.dirname(link), { recursive: true }); fs.symlinkSync(path.join('..', '..', DS, 'skills', s), link); }
    done.push(`${rel(link)} → ${DS}/skills/${s}`);
  }
}

console.log(`${dry ? 'Haría' : 'Hecho'}:\n${done.map((d) => `  ✔ ${d}`).join('\n') || '  (nada)'}`);
if (skipped.length) console.log(`Sin cambios:\n${skipped.map((d) => `  · ${d}`).join('\n')}`);
if (warnings.length) console.log(`Revisa:\n${warnings.map((d) => `  ⚠ ${d}`).join('\n')}`);
