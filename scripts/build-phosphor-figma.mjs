#!/usr/bin/env node
// Prepara lotes de código para crear los iconos de Phosphor como componentes en Figma (vía MCP, herramienta use_figma).
// Cada icono es un component set con la propiedad «Weight» (Regular / Fill), los dos pesos que permite el sistema.
//   node scripts/build-phosphor-figma.mjs [selección] [--batch 30] [--fill-variable colors.neutral.neutral.12]
// Selección (una sola):
//   (nada) / --registry      los iconos de icons/phosphor/registry.json
//   --all                    los 1.512 iconos del catálogo
//   --category arrows        una categoría del catálogo
//   --names arrow-right,plus  nombres concretos (kebab-case)
// Salida: .cache/figma-phosphor/batch-001.js, batch-002.js… (cada uno es el `code` de una llamada a use_figma)
// y entry.js, que se ejecuta al final: crea o actualiza «Phosphor Icon», el componente de entrada con las
// propiedades Icon (instance swap entre todos los iconos) y Weight (del icono interior, expuesta).
// Los SVG se leen de .cache/phosphor (lo crea `npm run phosphor:catalog`). Sin dependencias.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const batchSize = Number(val('--batch') ?? 30);
const fillVar = val('--fill-variable') ?? 'colors.neutral.neutral.12';

const cat = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'phosphor', 'catalog.json'), 'utf8'));
const assets = path.join(root, '.cache', 'phosphor', 'assets');
if (!fs.existsSync(assets)) throw new Error('Falta .cache/phosphor: ejecuta antes `npm run phosphor:catalog`.');

// Iconos del registry (kebab-case): valores preferidos del swap en «Phosphor Icon»; el primero es el valor por defecto.
const reg = JSON.parse(fs.readFileSync(path.join(root, 'icons', 'phosphor', 'registry.json'), 'utf8'));
const pas = (n) => n.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const byPascal = new Map(cat.icons.flatMap((i) => [[i.pascal, i], ...(i.aliases ?? []).map((a) => [pas(a), i])]));
const miss = reg.icons.filter((i) => !byPascal.has(i.name)).map((i) => i.name);
if (miss.length) throw new Error(`En el registry y no en el catálogo: ${miss.join(', ')}`);
const registryIcons = [...new Map(reg.icons.map((i) => [byPascal.get(i.name).name, byPascal.get(i.name)])).values()];

let list;
if (args.includes('--all')) list = cat.icons;
else if (val('--category')) {
    const c = val('--category');
    if (!cat.categories.some((x) => x.id === c)) throw new Error(`Categoría desconocida «${c}». Hay: ${cat.categories.map((x) => x.id).join(', ')}`);
    list = cat.icons.filter((i) => i.categories.includes(c));
} else if (val('--names')) {
    const ns = val('--names').split(',').map((s) => s.trim());
    const bad = ns.filter((n) => !cat.icons.some((i) => i.name === n));
    if (bad.length) throw new Error(`No existen en el catálogo: ${bad.join(', ')}`);
    list = ns.map((n) => cat.icons.find((i) => i.name === n));
} else list = registryIcons;

// Datos mínimos por icono: nombre, grupo de Figma, descripción (para el buscador de Figma) y el SVG de cada peso a 24 × 24.
const groupTitle = Object.fromEntries(cat.figmaCategories.map((c) => [c.id, c.title]));
const svg = (w, n) => fs.readFileSync(path.join(assets, w, w === 'regular' ? `${n}.svg` : `${n}-${w}.svg`), 'utf8')
    .trim().replace('<svg ', '<svg width="24" height="24" ').replace(/fill="currentColor"/g, 'fill="#000"');
const items = list.map((i) => ({
    n: i.name,
    g: groupTitle[i.figmaCategory] ?? 'Sin categoría',
    d: `phosphor:${i.name}\ncategorías: ${i.categories.join(', ')}\ntags: ${i.tags.join(', ')}`,
    r: svg('regular', i.name),
    f: svg('fill', i.name),
}));

const tpl = (batch) => `// Phosphor → Figma. Lote de ${batch.length} iconos (Weight: Regular / Fill). Seguro de repetir: salta los que ya existen.
const FILL_VARIABLE = ${JSON.stringify(fillVar)}; // variable de color del relleno (si no existe, queda negro y se avisa)
const PAGE = 'Iconos Phosphor', FRAME = 'Phosphor';
const ICONS = ${JSON.stringify(batch)};

let page = figma.root.children.find((p) => p.name === PAGE);
if (!page) { page = figma.createPage(); page.name = PAGE; }
await figma.setCurrentPageAsync(page);

let grid = page.children.find((n) => n.type === 'FRAME' && n.name === FRAME);
if (!grid) {
  grid = figma.createAutoLayout('HORIZONTAL', { name: FRAME, itemSpacing: 16, paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24 });
  grid.layoutWrap = 'WRAP'; grid.counterAxisSpacing = 16;
  grid.resize(1600, 100); grid.layoutSizingHorizontal = 'FIXED'; grid.layoutSizingVertical = 'HUG';
  grid.fills = []; page.appendChild(grid); grid.x = 100; grid.y = 100;
}

const norm = (s) => s.replace(/[\\/]/g, '.');
let variable = null;
for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) if (norm(v.name) === FILL_VARIABLE) { variable = v; break; }

const variant = (svg, weight) => {
  const tmp = figma.createNodeFromSvg(svg);
  const comp = figma.createComponent();
  comp.name = 'Weight=' + weight;
  comp.resize(24, 24); comp.fills = []; comp.clipsContent = false;
  for (const ch of [...tmp.children]) comp.appendChild(ch);
  tmp.remove();
  if (variable) {
    for (const n of comp.findAll((x) => 'fills' in x && Array.isArray(x.fills) && x.fills.length > 0)) {
      n.fills = n.fills.map((p) => p.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(p, 'color', variable) : p);
    }
  }
  page.appendChild(comp);
  return comp;
};

const existing = new Set(grid.children.map((c) => (c.description ?? '').split('\\n')[0]));
const created = [], skipped = [];
for (const it of ICONS) {
  if (existing.has('phosphor:' + it.n)) { skipped.push(it.n); continue; }
  const set = figma.combineAsVariants([variant(it.r, 'Regular'), variant(it.f, 'Fill')], grid);
  set.name = it.g + ' / ' + it.n;
  set.description = it.d;
  set.layoutMode = 'HORIZONTAL'; set.itemSpacing = 8;
  set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.fills = [];
  created.push(set.id);
}
return { page: page.id, grid: grid.id, created: created.length, skipped: skipped.length, fillVariable: variable ? variable.name : 'NO ENCONTRADA (relleno negro)', createdNodeIds: created };
`;

const entryTpl = (preferred) => `// Phosphor → Figma. Componente de entrada «Phosphor Icon». Ejecutar DESPUÉS de los lotes. Seguro de repetir.
// Propiedades: Icon (instance swap; preferidos = registry) y Weight (variante del icono interior, expuesta).
const PAGE = 'Iconos Phosphor', FRAME = 'Phosphor', ENTRY = 'Phosphor Icon';
const PREFERRED = ${JSON.stringify(preferred)}; // el primero es el valor por defecto

const page = figma.root.children.find((p) => p.name === PAGE);
if (!page) throw new Error('No existe la página «' + PAGE + '»: ejecuta antes los lotes batch-NNN.js.');
await figma.setCurrentPageAsync(page);
const grid = page.children.find((n) => n.type === 'FRAME' && n.name === FRAME);
if (!grid) throw new Error('No existe el frame «' + FRAME + '»: ejecuta antes los lotes batch-NNN.js.');

const sets = new Map(grid.children.filter((n) => n.type === 'COMPONENT_SET')
  .map((n) => [(n.description ?? '').split('\\n')[0].replace('phosphor:', ''), n]));
const available = PREFERRED.filter((n) => sets.has(n));
if (!available.length) throw new Error('Ningún icono del registry está creado: ejecuta antes los lotes.');
const regular = (set) => set.children.find((c) => c.name === 'Weight=Regular') ?? set.defaultVariant;

let entry = page.children.find((n) => n.type === 'COMPONENT' && n.name === ENTRY);
if (!entry) {
  entry = figma.createComponent();
  entry.name = ENTRY;
  entry.resize(24, 24); entry.fills = []; entry.clipsContent = false;
  page.appendChild(entry); entry.x = grid.x; entry.y = grid.y - 64;
}
entry.description = 'phosphor:entry\\nInserta este componente. Icon: elige el icono (buscador con todo el catálogo). Weight: Regular / Fill (fill solo para estado activo).\\nContrato: contracts/PhosphorIconLibrary.contract.json';

let inst = entry.children.find((n) => n.type === 'INSTANCE');
if (!inst) {
  inst = regular(sets.get(available[0])).createInstance();
  entry.appendChild(inst); inst.x = 0; inst.y = 0;
}
inst.name = 'icon';
inst.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };

const preferredValues = available.map((n) => ({ type: 'COMPONENT_SET', key: sets.get(n).key }));
let key = Object.keys(entry.componentPropertyDefinitions).find((k) => k.split('#')[0] === 'Icon');
if (!key) key = entry.addComponentProperty('Icon', 'INSTANCE_SWAP', regular(sets.get(available[0])).id, { preferredValues });
else entry.editComponentProperty(key, { preferredValues });
inst.componentPropertyReferences = { mainComponent: key };
inst.isExposedInstance = true; // Weight del icono interior aparece en el panel de «Phosphor Icon»

return { entry: entry.id, iconProperty: key, default: available[0], preferred: available.length, missingFromFile: PREFERRED.filter((n) => !sets.has(n)) };
`;

const outDir = path.join(root, '.cache', 'figma-phosphor');
fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
let n = 0;
for (let i = 0; i < items.length; i += batchSize) {
    const f = path.join(outDir, `batch-${String(++n).padStart(3, '0')}.js`);
    fs.writeFileSync(f, tpl(items.slice(i, i + batchSize)));
}
fs.writeFileSync(path.join(outDir, 'entry.js'), entryTpl(registryIcons.map((i) => i.name)));
const kb = Math.round(fs.statSync(path.join(outDir, 'batch-001.js')).size / 1024);
console.log(`${items.length} iconos → ${n} lote(s) en .cache/figma-phosphor/ (el primero pesa ${kb} KB) + entry.js («Phosphor Icon»). Variable de relleno: ${fillVar}`);
