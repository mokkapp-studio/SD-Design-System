#!/usr/bin/env node
// Genera icons/catalog.json: el listado COMPLETO de Lucide (nombre, tags, categorías, alias).
//   node scripts/build-icon-catalog.mjs            -> usa .cache/lucide (lo descarga la primera vez)
//   node scripts/build-icon-catalog.mjs --update   -> actualiza .cache/lucide antes de leer
//   node scripts/build-icon-catalog.mjs --source ruta/al/repo-lucide   -> usa un clon que ya tengas
// Sin dependencias. Necesita git y red solo la primera vez (o con --update).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argVal = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const REPO = 'https://github.com/lucide-icons/lucide.git';
const src = path.resolve(argVal('--source') ?? path.join(root, '.cache', 'lucide'));
const git = (...a) => execFileSync('git', a, { stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();

if (!fs.existsSync(path.join(src, 'icons'))) {
    if (argVal('--source')) throw new Error(`No existe ${src}/icons`);
    console.log('Descargando Lucide (solo iconos y categorías)…');
    fs.mkdirSync(path.dirname(src), { recursive: true });
    git('clone', '--quiet', '--depth', '1', '--filter=blob:none', '--sparse', REPO, src);
    git('-C', src, 'sparse-checkout', 'set', 'icons', 'categories');
} else if (args.includes('--update') && !argVal('--source')) {
    git('-C', src, 'pull', '--quiet', '--depth', '1');
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const pascal = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');

const iconsDir = path.join(src, 'icons');
const names = fs.readdirSync(iconsDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const icons = names.map((name) => {
    const j = readJson(path.join(iconsDir, `${name}.json`));
    if (!fs.existsSync(path.join(iconsDir, `${name}.svg`))) throw new Error(`Falta el SVG de «${name}»`);
    const aliases = (j.aliases ?? []).map((a) => (typeof a === 'string' ? a : a.name)).sort();
    return { name, pascal: pascal(name), categories: j.categories ?? [], tags: j.tags ?? [], ...(aliases.length ? { aliases } : {}) };
});

const catDir = path.join(src, 'categories');
const categories = fs.readdirSync(catDir).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const id = f.slice(0, -5); const j = readJson(path.join(catDir, f));
    return { id, title: j.title, description: j.description, count: icons.filter((i) => i.categories.includes(id)).length };
});
const unknown = [...new Set(icons.flatMap((i) => i.categories))].filter((c) => !categories.some((x) => x.id === c));
if (unknown.length) throw new Error(`Categorías sin definir: ${unknown.join(', ')}`);

let commit = 'desconocido', date = null;
try { commit = git('-C', src, 'rev-parse', '--short', 'HEAD'); date = git('-C', src, 'log', '-1', '--format=%cs'); } catch { }

const head = {
    $description: 'Catálogo completo de Lucide. NO editar a mano: se genera con `npm run icons:catalog`. Es la lista de TODO lo que existe; lo que se puede usar en código está en icons/registry.json (un subconjunto de este catálogo).',
    library: 'lucide', package: 'lucide-react', docs: 'https://lucide.dev/icons/',
    source: { repo: 'lucide-icons/lucide', commit, date },
    canvas: { size: 24, unit: 'px', strokeWidth: 2, linecap: 'round', linejoin: 'round' },
    count: icons.length,
};
// Un icono por línea: el diff de git se lee bien.
const out = '{\n' + Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n')
    + ',\n  "categories": [\n' + categories.map((c) => '    ' + JSON.stringify(c)).join(',\n')
    + '\n  ],\n  "icons": [\n' + icons.map((i) => '    ' + JSON.stringify(i)).join(',\n') + '\n  ]\n}\n';
fs.writeFileSync(path.join(root, 'icons', 'catalog.json'), out);
console.log(`icons/catalog.json: ${icons.length} iconos, ${categories.length} categorías (Lucide @ ${commit})`);
