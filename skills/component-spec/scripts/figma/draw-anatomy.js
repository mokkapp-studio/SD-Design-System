// ESCRIBE en Figma. Dibuja la lámina «_anatomy»: componente sobre fondo oscuro con marcadores numerados
// (magenta) que apuntan a cada parte. Es una imagen: se exporta con exportAsync y va a la Spec.
// Ejecutar con use_figma / figma_execute tras confirmar archivo y página. Edita solo los parámetros.
const COMPONENT_ID = 'PON_AQUI_EL_ID';          // COMPONENT_SET o COMPONENT ya dibujado
const COMPONENT_NAME = 'PON_AQUI_EL_NOMBRE';    // contract.name
const HELPERS_PAGE = 'Helpers';                 // página donde viven los building blocks
const SECTION_NAME = 'Building blocks · ' + COMPONENT_NAME;
// Una entrada por parte de anatomy (contrato): n = número del marcador; layer = nombre de la capa (anatomy.<parte>.figmaLayer, sin explicaciones).
// props = propiedades de la instancia para que la parte sea visible (p. ej. { iconStart: true }). Una fila de panel por cada VARIANT_SHOTS.
const VARIANT_SHOTS = [{ label: 'Default variant', props: {}, parts: [{ n: 1, layer: 'PON_AQUI_LA_CAPA' }] }];

const C = { bg: [27, 27, 27], panel: [34, 44, 44], surface: [250, 250, 250], marker: [196, 15, 224], dim: [172, 172, 172] };
const rgb = (a) => ({ r: a[0] / 255, g: a[1] / 255, b: a[2] / 255 });
const solid = (a) => [{ type: 'SOLID', color: rgb(a) }];
for (const st of ['Regular', 'Medium', 'Semi Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
const text = (chars, size, style, color, parent, x, y) => { const t = figma.createText(); t.fontName = { family: 'Inter', style }; t.fontSize = size; t.characters = chars; t.fills = solid(color); parent.appendChild(t); t.x = x; t.y = y; return t; };

const page = figma.root.children.find((p) => p.name.includes(HELPERS_PAGE));
if (!page) return 'Falta la página ' + HELPERS_PAGE;
await page.loadAsync(); await figma.setCurrentPageAsync(page);
let section = page.children.find((n) => n.type === 'SECTION' && n.name === SECTION_NAME);
if (!section) { section = figma.createSection(); section.name = SECTION_NAME; page.appendChild(section); section.x = 0; section.y = 0; }
for (const old of section.children.filter((n) => n.name === '_anatomy')) old.remove();

const src = await figma.getNodeByIdAsync(COMPONENT_ID);
const base = src.type === 'COMPONENT_SET' ? src.defaultVariant : src;
const PW = 640, PH = 300, TOP = 90;
const frame = figma.createFrame(); frame.name = '_anatomy'; frame.fills = solid(C.bg); frame.clipsContent = true; section.appendChild(frame);
frame.resize(PW * VARIANT_SHOTS.length, PH + TOP + 20); frame.x = 80; frame.y = 80;
text('Default variant: ' + base.name, 15, 'Regular', C.dim, frame, 64, 40);

let i = 0;
for (const shot of VARIANT_SHOTS) {
  const ox = i++ * PW;
  const panel = figma.createRectangle(); panel.name = 'panel-' + i; panel.fills = solid(C.panel); frame.appendChild(panel); panel.resize(PW, PH); panel.x = ox; panel.y = TOP;
  text('◇', 16, 'Regular', C.dim, frame, ox + 64, TOP + 22); text(shot.label, 16, 'Semi Bold', [255, 255, 255], frame, ox + 88, TOP + 21);
  const inst = base.createInstance(); frame.appendChild(inst);
  if (Object.keys(shot.props).length) inst.setProperties(shot.props);
  const pad = 24, w = inst.width + pad * 2, h = inst.height + pad * 2;
  const surf = figma.createRectangle(); surf.name = 'surface'; surf.fills = solid(C.surface); surf.cornerRadius = 6; frame.appendChild(surf);
  surf.resize(w, h); surf.x = ox + (PW - w) / 2; surf.y = TOP + (PH - h) / 2 + 20;
  frame.insertChild(frame.children.indexOf(inst), surf);
  inst.x = surf.x + pad; inst.y = surf.y + pad;
  const ix = inst.absoluteTransform[0][2], iy = inst.absoluteTransform[1][2];
  for (const part of shot.parts) {
    const layer = inst.findOne((n) => n.name === part.layer);
    if (!layer) { text('⚠ capa no encontrada: ' + part.layer, 12, 'Regular', C.marker, frame, ox + 64, TOP + PH - 30); continue; }
    const cx = layer.absoluteTransform[0][2] - ix + inst.x + layer.width / 2, top = layer.absoluteTransform[1][2] - iy + inst.y;
    const m = figma.createFrame(); m.name = 'marker-' + part.n; m.fills = solid(C.marker); m.cornerRadius = 12; m.resize(24, 24); frame.appendChild(m);
    m.layoutMode = 'HORIZONTAL'; m.primaryAxisAlignItems = 'CENTER'; m.counterAxisAlignItems = 'CENTER';
    text(String(part.n), 13, 'Medium', [255, 255, 255], m, 0, 0);
    m.x = cx - 12; m.y = surf.y - 36;
    const line = figma.createRectangle(); line.fills = solid(C.marker); frame.appendChild(line); line.resize(1, Math.max(1, top - (m.y + 24))); line.x = cx - 0.5; line.y = m.y + 24;
  }
}
return JSON.stringify({ frame: frame.id, section: section.id });
