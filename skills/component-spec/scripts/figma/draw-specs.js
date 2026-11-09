// ESCRIBE en Figma. Dibuja la lámina «_specs»: cotas del componente (padding en verde, espacio entre partes
// en naranja, ancho y alto en azul con etiqueta). Es una imagen; los datos van como tabla en la Spec.
// Las medidas se leen de la instancia (auto layout); una medida con variable enlazada lleva su nombre,
// la que no, lleva «sin token». Ejecutar tras confirmar archivo y página. Edita solo los parámetros.
const COMPONENT_ID = 'PON_AQUI_EL_ID';
const COMPONENT_NAME = 'PON_AQUI_EL_NOMBRE';
const HELPERS_PAGE = 'Helpers';
const SECTION_NAME = 'Building blocks · ' + COMPONENT_NAME;
const SHOTS = [{ label: 'default', props: {} }];   // una cota por cada caso que quieras mostrar

const C = { bg: [27, 27, 27], surface: [250, 250, 250], pad: [22, 122, 0], gap: [200, 71, 10], dim: [26, 112, 224], dimText: [111, 168, 255], grey: [172, 172, 172] };
const rgb = (a) => ({ r: a[0] / 255, g: a[1] / 255, b: a[2] / 255 });
const solid = (a, o = 1) => [{ type: 'SOLID', color: rgb(a), opacity: o }];
for (const st of ['Regular', 'Medium']) await figma.loadFontAsync({ family: 'Inter', style: st });
const text = (chars, size, style, color, parent, x, y) => { const t = figma.createText(); t.fontName = { family: 'Inter', style }; t.fontSize = size; t.characters = chars; t.fills = solid(color); parent.appendChild(t); t.x = x; t.y = y; return t; };
const rect = (parent, x, y, w, h, color, o = 1, name = 'Rectangle') => { const r = figma.createRectangle(); r.name = name; r.fills = solid(color, o); parent.appendChild(r); r.resize(Math.max(w, 1), Math.max(h, 1)); r.x = x; r.y = y; return r; };
const chip = (parent, label, x, y) => { const f = figma.createFrame(); f.name = 'chip'; f.fills = solid(C.dim); f.cornerRadius = 4; f.layoutMode = 'HORIZONTAL'; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.paddingLeft = f.paddingRight = 8; f.paddingTop = f.paddingBottom = 3; parent.appendChild(f); text(label, 14, 'Medium', [255, 255, 255], f, 0, 0); f.x = x; f.y = y; return f; };
const bound = async (n, field) => { const b = n.boundVariables && n.boundVariables[field]; if (!b) return null; const v = await figma.variables.getVariableByIdAsync((Array.isArray(b) ? b[0] : b).id); return v && v.name; };
const size = (n, axis) => { const m = axis === 'h' ? n.layoutSizingHorizontal : n.layoutSizingVertical; return m === 'FILL' ? 'fill' : m === 'HUG' ? 'hug' : null; };

const page = figma.root.children.find((p) => p.name.includes(HELPERS_PAGE));
if (!page) return 'Falta la página ' + HELPERS_PAGE;
await page.loadAsync(); await figma.setCurrentPageAsync(page);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === SECTION_NAME);
if (!section) { section = figma.createSection(); section.name = SECTION_NAME; page.appendChild(section); section.x = 0; section.y = 0; }
for (const old of section.children.filter((n) => n.name === '_specs')) old.remove();

const src = await figma.getNodeByIdAsync(COMPONENT_ID);
const base = src.type === 'COMPONENT_SET' ? src.defaultVariant : src;
const CW = 640, CH = 330, LEG = 110;
const frame = figma.createFrame(); frame.name = '_specs'; frame.fills = solid(C.bg); frame.clipsContent = true; section.appendChild(frame);
frame.resize(CW * SHOTS.length, CH + LEG); frame.x = 80; frame.y = 560;
rect(frame, 64, 56, 16, 16, C.pad, 1, 'legend-padding').cornerRadius = 3; text('Padding', 14, 'Regular', C.grey, frame, 88, 54);
rect(frame, 170, 56, 16, 16, C.gap, 1, 'legend-gap').cornerRadius = 3; text('Space between', 14, 'Regular', C.grey, frame, 194, 54);
text('Sizes: a number is fixed, Hug fits the content, Fill takes the space left', 14, 'Regular', C.grey, frame, 330, 54);

let i = 0;
for (const shot of SHOTS) {
  const ox = i++ * CW;
  const inst = base.createInstance(); frame.appendChild(inst);
  if (Object.keys(shot.props).length) inst.setProperties(shot.props);
  const w = inst.width, h = inst.height;
  const surf = rect(frame, 0, 0, w + 80, h + 80, C.surface, 1, 'surface'); surf.cornerRadius = 6;
  surf.x = ox + 64; surf.y = LEG + 80;
  frame.insertChild(frame.children.indexOf(inst), surf);
  inst.x = surf.x + 40; inst.y = surf.y + 40;
  const pads = { top: inst.paddingTop || 0, right: inst.paddingRight || 0, bottom: inst.paddingBottom || 0, left: inst.paddingLeft || 0 };
  // padding (verde, translúcido sobre el componente)
  if (pads.left) rect(frame, inst.x, inst.y, pads.left, h, C.pad, 0.45, 'pad-left');
  if (pads.right) rect(frame, inst.x + w - pads.right, inst.y, pads.right, h, C.pad, 0.45, 'pad-right');
  if (pads.top) rect(frame, inst.x + pads.left, inst.y, w - pads.left - pads.right, pads.top, C.pad, 0.45, 'pad-top');
  if (pads.bottom) rect(frame, inst.x + pads.left, inst.y + h - pads.bottom, w - pads.left - pads.right, pads.bottom, C.pad, 0.45, 'pad-bottom');
  // espacio entre partes visibles (naranja)
  if (inst.layoutMode !== 'NONE' && inst.itemSpacing) {
    const kids = inst.children.filter((k) => k.visible && k.layoutPositioning !== 'ABSOLUTE');
    for (let k = 0; k < kids.length - 1; k++) {
      const a = kids[k], b = kids[k + 1];
      if (inst.layoutMode === 'HORIZONTAL') rect(frame, inst.x + a.x + a.width, inst.y + a.y, b.x - a.x - a.width, a.height, C.gap, 0.55, 'gap-' + (k + 1));
      else rect(frame, inst.x + a.x, inst.y + a.y + a.height, a.width, b.y - a.y - a.height, C.gap, 0.55, 'gap-' + (k + 1));
    }
  }
  // cotas de alto (derecha) y ancho (abajo)
  const hTok = await bound(inst, 'height'), wTok = await bound(inst, 'width');
  const hx = inst.x + w + 28, wy = inst.y + h + 28;
  rect(frame, hx, inst.y, 2, h, C.dim, 1, 'dim-h'); rect(frame, hx - 8, inst.y - 1, 18, 2, C.dim); rect(frame, hx - 8, inst.y + h - 1, 18, 2, C.dim);
  chip(frame, 'height: ' + (size(inst, 'v') || Math.round(h)) + (hTok ? ' · ' + hTok : ' · sin token'), hx + 16, inst.y + h / 2 - 12);
  rect(frame, inst.x, wy, w, 2, C.dim, 1, 'dim-w'); rect(frame, inst.x - 1, wy - 8, 2, 18, C.dim); rect(frame, inst.x + w - 1, wy - 8, 2, 18, C.dim);
  chip(frame, 'width: ' + (size(inst, 'h') || Math.round(w)) + (wTok ? ' · ' + wTok : ' · sin token'), inst.x + w / 2 - 60, wy + 16);
  text(shot.label, 13, 'Regular', C.grey, frame, ox + 64, CH + LEG - 30);
}
return JSON.stringify({ frame: frame.id, section: section.id });
