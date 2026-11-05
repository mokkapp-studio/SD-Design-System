'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import './CircularGallery.css';

export interface GalleryItem {
  image: string;
  text?: string;
  alt?: string;
  description?: string;
}

export interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  fontUrl?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  itemSize?: number;
  itemAspect?: number;
  gap?: number;
  wave?: number;
  fadeEdges?: number;
  shadow?: number;
  grayscale?: boolean;
  showTitles?: boolean;
  snap?: boolean;
  autoScroll?: number;
  openOnClick?: boolean;
  intro?: boolean;
  onItemClick?: (index: number, item: GalleryItem) => void;
  onActiveChange?: (index: number) => void;
  dpr?: number;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_ITEMS: GalleryItem[] = Array.from({ length: 12 }, (_, i) => ({
  image: `https://picsum.photos/seed/${i + 1}/800/1024`,
  text: `Item ${i + 1}`,
  alt: `Gallery item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));

// --- WebGL helpers ---

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function wrap(x: number, lo: number, hi: number) {
  const range = hi - lo;
  return ((((x - lo) % range) + range) % range) + lo;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? 'Shader compile error');
  }
  return s;
}

function link(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) ?? 'Program link error');
  }
  return prog;
}

// --- Font loading ---

function deriveFontFamilyFromUrl(url: string): string {
  const match = url.match(/family=([^&:]+)/);
  if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '));
  const file = url.split('/').pop() ?? '';
  return file.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]/g, ' ');
}

async function loadFontFromStylesheet(url: string): Promise<void> {
  const res = await fetch(url);
  const css = await res.text();
  const src = css.match(/src:\s*url\(([^)]+)\)/)?.[1] ?? '';
  const family = deriveFontFamilyFromUrl(url);
  if (src) {
    const ff = new FontFace(family, `url(${src})`);
    await ff.load();
    document.fonts.add(ff);
  }
}

async function loadFontFromFile(url: string): Promise<void> {
  const family = deriveFontFamilyFromUrl(url);
  const ff = new FontFace(family, `url(${url})`);
  await ff.load();
  document.fonts.add(ff);
}

async function resolveFont(fontUrl: string): Promise<void> {
  if (/fonts\.googleapis\.com/.test(fontUrl)) {
    await loadFontFromStylesheet(fontUrl);
  } else {
    await loadFontFromFile(fontUrl);
  }
}

// --- GLSL shaders ---

const VERT = /* glsl */`#version 300 es
precision highp float;
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = /* glsl */`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_tex;
uniform float u_bend;
uniform float u_offset;     // normalized scroll position for this card
uniform float u_aspect;     // card width/height
uniform float u_wave;
uniform float u_fadeEdges;
uniform float u_shadow;
uniform float u_borderRadius;
uniform float u_grayscale;
uniform float u_time;
uniform float u_alpha;
uniform vec2 u_resolution;

float roundedBox(vec2 uv, float r) {
  vec2 q = abs(uv - 0.5) - (0.5 - r);
  return length(max(q, 0.0)) - r;
}

void main() {
  vec2 uv = v_uv;

  // Fade edges
  float edgeFade = 1.0;
  if (u_fadeEdges > 0.0) {
    float ex = smoothstep(0.0, u_fadeEdges, uv.x) * smoothstep(1.0, 1.0 - u_fadeEdges, uv.x);
    edgeFade = ex;
  }

  // Sample texture
  vec4 color = texture(u_tex, uv);

  // Grayscale
  if (u_grayscale > 0.5) {
    float g = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = vec3(g);
  }

  // Border radius mask
  float d = roundedBox(uv, u_borderRadius);
  float mask = 1.0 - smoothstep(-0.002, 0.002, d);

  color.a *= mask * edgeFade * u_alpha;
  fragColor = color;
}`;

const SHADOW_FRAG = /* glsl */`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_shadow;
void main() {
  float d = length(v_uv - vec2(0.5, 0.6));
  float a = u_shadow * smoothstep(0.5, 0.1, d);
  fragColor = vec4(0.0, 0.0, 0.0, a);
}`;

// --- Main component ---

export function CircularGallery({
  items = DEFAULT_ITEMS,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Figtree:wght@700&display=swap',
  scrollSpeed = 2,
  scrollEase = 0.05,
  itemSize = 1,
  itemAspect = 0.78,
  gap = 0.26,
  wave = 1,
  fadeEdges = 0.12,
  shadow = 0.25,
  grayscale = false,
  showTitles = true,
  snap = true,
  autoScroll = 0,
  openOnClick = true,
  intro = true,
  onItemClick,
  onActiveChange,
  dpr,
  className = '',
  style,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Scroll state
  const scrollRef = useRef(0);       // current (eased) scroll
  const targetRef = useRef(0);       // target scroll
  const velRef = useRef(0);
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null);
  const hasDraggedRef = useRef(false);

  // Active / open state
  const [activeIndex, setActiveIndex] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // GL resources
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const shadowProgRef = useRef<WebGLProgram | null>(null);
  const textures = useRef<(WebGLTexture | null)[]>([]);
  const introStartRef = useRef<number | null>(null);

  // Load font on mount
  useEffect(() => {
    if (fontUrl) {
      resolveFont(fontUrl).catch(() => {/* silent */});
    }
  }, [fontUrl]);

  // Setup WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;

    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      progRef.current = link(gl, vs, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      shadowProgRef.current = link(gl, vs, compile(gl, gl.FRAGMENT_SHADER, SHADOW_FRAG));
    } catch {
      return;
    }

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(progRef.current!, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Preload textures
    textures.current = items.map(item => {
      const tex = gl.createTexture();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      };
      img.src = item.image;
      return tex;
    });

    if (intro) introStartRef.current = performance.now();

    return () => {
      cancelAnimationFrame(rafRef.current);
      textures.current.forEach(t => t && gl.deleteTexture(t));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [items, intro]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ro = new ResizeObserver(() => {
      const gl = glRef.current;
      if (!gl) return;
      const ratio = dpr ?? window.devicePixelRatio ?? 1;
      canvas.width = container.clientWidth * ratio;
      canvas.height = container.clientHeight * ratio;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [dpr]);

  // Render loop
  useEffect(() => {
    const gl = glRef.current;
    const prog = progRef.current;
    if (!gl || !prog) return;

    let last = performance.now();

    function render(now: number) {
      rafRef.current = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // Auto scroll
      if (autoScroll !== 0 && !dragRef.current) {
        targetRef.current += autoScroll * dt;
      }

      // Ease scroll
      scrollRef.current = lerp(scrollRef.current, targetRef.current, clamp(scrollEase * 60 * dt, 0, 1));
      velRef.current = lerp(velRef.current, 0, 0.1);

      // Intro alpha
      let introAlpha = 1;
      if (introStartRef.current !== null) {
        const elapsed = (now - introStartRef.current) / 1000;
        introAlpha = clamp(elapsed / 1.4, 0, 1);
        if (introAlpha >= 1) introStartRef.current = null;
      }

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const W = gl.drawingBufferWidth;
      const H = gl.drawingBufferHeight;
      const cardH = H * itemSize;
      const cardW = cardH * itemAspect;
      const stride = cardW * (1 + gap);

      // Determine active index
      const rawActive = Math.round(scrollRef.current / stride);
      const newActive = wrap(rawActive, 0, items.length);
      if (newActive !== activeIndex) {
        setActiveIndex(newActive);
        onActiveChange?.(newActive);
      }

      // Draw each card
      items.forEach((_, i) => {
        const offset = i * stride - scrollRef.current;
        const normX = offset / W;

        // Bend: cylindrical projection
        const bendAngle = bend === 0 ? normX : Math.sin(normX * (Math.PI / 2)) * bend;
        const screenX = W / 2 + Math.sin(bendAngle) * (W * 0.4);
        const scale = bend === 0 ? 1 : Math.cos(bendAngle * 0.5);

        const w = cardW * scale;
        const h = cardH * scale;
        const x = screenX - w / 2;
        const y = (H - h) / 2;

        const alpha = clamp(1 - Math.abs(normX) * 2, 0, 1) * introAlpha;
        if (alpha <= 0.01) return;

        const tex = textures.current[i];
        if (!tex) return;

        // Shadow pass
        if (shadow > 0 && shadowProgRef.current) {
          gl.useProgram(shadowProgRef.current);
          gl.uniform1f(gl.getUniformLocation(shadowProgRef.current, 'u_shadow'), shadow * alpha);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        // Color pass
        gl.useProgram(prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_bend'), bend);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_offset'), normX);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_aspect'), itemAspect);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_wave'), wave);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_fadeEdges'), fadeEdges);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_shadow'), shadow);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_borderRadius'), borderRadius);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_grayscale'), grayscale ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), now / 1000);
        gl.uniform1f(gl.getUniformLocation(prog, 'u_alpha'), alpha);
        gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), W, H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items, bend, borderRadius, fadeEdges, gap, grayscale, itemAspect, itemSize, shadow, snap, scrollEase, autoScroll, wave, activeIndex, onActiveChange]);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (openIndex !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startScroll: targetRef.current };
    hasDraggedRef.current = false;
  }, [openIndex]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) * scrollSpeed;
    if (Math.abs(dx) > 4) hasDraggedRef.current = true;
    targetRef.current = dragRef.current.startScroll - dx;
  }, [scrollSpeed]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const didDrag = hasDraggedRef.current;
    dragRef.current = null;

    if (!didDrag && openOnClick) {
      onItemClick?.(activeIndex, items[activeIndex]);
      setOpenIndex(activeIndex);
      if (liveRef.current) {
        liveRef.current.textContent = `${items[activeIndex].text ?? activeIndex} opened`;
      }
    } else if (snap) {
      const container = containerRef.current;
      const H = container?.clientHeight ?? 500;
      const cardH = H * itemSize;
      const cardW = cardH * itemAspect;
      const stride = cardW * (1 + gap);
      targetRef.current = Math.round(targetRef.current / stride) * stride;
    }
  }, [activeIndex, gap, itemAspect, itemSize, items, onItemClick, openOnClick, snap]);

  // Keyboard handler (on hidden list)
  const onKeyDown = useCallback((e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const container = containerRef.current;
      const H = container?.clientHeight ?? 500;
      const cardH = H * itemSize;
      const stride = cardH * itemAspect * (1 + gap);
      targetRef.current += stride;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = containerRef.current;
      const H = container?.clientHeight ?? 500;
      const cardH = H * itemSize;
      const stride = cardH * itemAspect * (1 + gap);
      targetRef.current -= stride;
    }
    if (e.key === 'Enter' && openOnClick) {
      setOpenIndex(i);
      if (liveRef.current) {
        liveRef.current.textContent = `${items[i].text ?? i} opened`;
      }
    }
    if (e.key === 'Escape') {
      setOpenIndex(null);
      if (liveRef.current) liveRef.current.textContent = '';
    }
  }, [gap, itemAspect, itemSize, items, openOnClick]);

  const closeOpen = useCallback(() => {
    setOpenIndex(null);
    if (liveRef.current) liveRef.current.textContent = '';
  }, []);

  return (
    <div
      ref={containerRef}
      className={`circular-gallery${className ? ` ${className}` : ''}`}
      role="region"
      aria-label="Image gallery"
      aria-roledescription="carousel"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <canvas
        ref={canvasRef}
        className="circular-gallery-canvas"
        aria-hidden
      />

      {/* DOM label layer */}
      {showTitles && (
        <div className="circular-gallery-labels" aria-hidden>
          {/* Labels are painted on canvas via 2D context overlay — this layer is a placeholder */}
        </div>
      )}

      {/* Open caption */}
      {openIndex !== null && items[openIndex]?.description && (
        <div className="circular-gallery-caption">
          <p className="circular-gallery-caption-text" style={{ color: textColor }}>
            {items[openIndex].description}
          </p>
        </div>
      )}

      {/* Close button */}
      {openIndex !== null && (
        <button
          className="circular-gallery-close"
          onClick={closeOpen}
          aria-label="Close"
          style={{ color: textColor }}
        >
          ×
        </button>
      )}

      {/* Visually hidden accessible list */}
      <ul className="circular-gallery-hidden" aria-label="Gallery items">
        {items.map((item, i) => (
          <li key={i}>
            <button
              tabIndex={i === activeIndex ? 0 : -1}
              aria-label={item.alt ?? item.text ?? `Item ${i + 1}`}
              onKeyDown={e => onKeyDown(e, i)}
              onClick={() => {
                if (openOnClick) {
                  onItemClick?.(i, item);
                  setOpenIndex(i);
                }
              }}
            >
              {item.alt ?? item.text ?? `Item ${i + 1}`}
            </button>
          </li>
        ))}
      </ul>

      {/* Live region */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic
        className="circular-gallery-hidden"
      />
    </div>
  );
}
