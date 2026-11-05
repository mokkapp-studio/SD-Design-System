import { useEffect, useMemo, useRef, useState } from 'react';

// Shutter speed stops: index 0 = fastest, 7 = slowest
const SPEEDS = ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1"'] as const;
const TRAIL_COLORS = ['#fff7e0', '#ffe066', '#ff6b35', '#ff2244', '#a0d8ef'];

export interface Hero32Props {
  headline?: string;
  subline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  trailCount?: number;
  initialShutterIndex?: number;
}

interface TrailConfig {
  id: number;
  y: number;        // % of height
  color: string;
  width: number;    // px
  delay: number;    // animation-delay s
  duration: number; // animation-duration s
}

export function Hero32({
  headline = 'Every second, a masterpiece.',
  subline = 'The camera app built for golden-hour addicts. Control your exposure, own the moment.',
  ctaLabel = 'Download free',
  ctaHref = '#',
  trailCount = 24,
  initialShutterIndex = 2,
}: Hero32Props) {
  const [idx, setIdx] = useState(
    Math.max(0, Math.min(SPEEDS.length - 1, initialShutterIndex))
  );
  const dialRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startAngle: number; startIdx: number } | null>(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Stable trail configs — only regenerate when trailCount changes
  const trails = useMemo<TrailConfig[]>(() =>
    Array.from({ length: trailCount }, (_, i) => ({
      id: i,
      y: 4 + (i / trailCount) * 92,
      color: TRAIL_COLORS[i % TRAIL_COLORS.length],
      width: 1 + (i % 3) * 0.6,
      delay: -(i * 0.37),
      duration: 1.1 + (i % 5) * 0.45,
    })), [trailCount]);

  // Map shutter index to visual trail properties
  const progress = idx / (SPEEDS.length - 1); // 0–1
  const trailLengthVw = 15 + progress * 70;   // 15vw → 85vw
  const trailBlur = progress * 7;              // 0px → 7px
  const trailOpacity = 0.2 + progress * 0.7;  // 0.2 → 0.9

  // Dial drag — pointer events
  function pointerAngle(e: PointerEvent): number {
    const el = dialRef.current!;
    const { left, top, width, height } = el.getBoundingClientRect();
    return Math.atan2(e.clientY - (top + height / 2), e.clientX - (left + width / 2)) * (180 / Math.PI);
  }

  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startAngle: pointerAngle(e.nativeEvent), startIdx: idx };
  }

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    let delta = pointerAngle(e.nativeEvent) - dragRef.current.startAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const steps = Math.round(delta / (360 / SPEEDS.length));
    setIdx(Math.max(0, Math.min(SPEEDS.length - 1, dragRef.current.startIdx + steps)));
  }

  function onUp() { dragRef.current = null; }

  // Keyboard control when dial is focused
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setIdx(i => Math.min(SPEEDS.length - 1, i + 1));
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
  }

  const dialRotation = idx * (360 / SPEEDS.length);

  return (
    <section style={{
      position: 'relative',
      minHeight: '100svh',
      background: '#06060f',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* keyframe injected once */}
      <style>{`
        @keyframes trail-flow {
          from { transform: translateX(-110%); }
          to   { transform: translateX(110vw); }
        }
      `}</style>

      {/* Light trails */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {trails.map(t => (
          <div key={t.id} style={{
            position: 'absolute',
            top: `${t.y}%`,
            left: 0,
            width: `${trailLengthVw}vw`,
            height: `${t.width}px`,
            background: `linear-gradient(90deg, transparent, ${t.color} 25%, ${t.color} 75%, transparent)`,
            filter: `blur(${trailBlur}px)`,
            opacity: trailOpacity,
            borderRadius: '999px',
            willChange: 'transform',
            transition: 'width 0.4s ease, filter 0.4s ease, opacity 0.4s ease',
            animation: reducedMotion.current
              ? 'none'
              : `trail-flow ${t.duration}s linear ${t.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Vignette — focus attention to center */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, #06060f 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '0 24px', gap: 0,
      }}>
        {/* Shutter dial */}
        <div
          ref={dialRef}
          role="slider"
          aria-label="Shutter speed"
          aria-valuemin={0}
          aria-valuemax={SPEEDS.length - 1}
          aria-valuenow={idx}
          aria-valuetext={SPEEDS[idx]}
          tabIndex={0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onKeyDown={onKeyDown}
          style={{
            width: 160, height: 160,
            borderRadius: '50%',
            position: 'relative',
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
            marginBottom: 48,
          }}
        >
          {/* Rotating ring (SVG) */}
          <svg
            viewBox="0 0 160 160"
            width={160}
            height={160}
            style={{
              position: 'absolute', inset: 0,
              transform: `rotate(${dialRotation}deg)`,
              transition: 'transform 0.15s ease',
            }}
          >
            {/* Ring background */}
            <circle cx={80} cy={80} r={76} fill="#111124" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />

            {/* Tick marks */}
            {SPEEDS.map((_, i) => {
              const angle = (i / SPEEDS.length) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const outerR = 70;
              const innerR = i === idx ? 54 : 60;
              return (
                <line
                  key={i}
                  x1={80 + Math.cos(rad) * outerR}
                  y1={80 + Math.sin(rad) * outerR}
                  x2={80 + Math.cos(rad) * innerR}
                  y2={80 + Math.sin(rad) * innerR}
                  stroke={i === idx ? '#ffe066' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={i === idx ? 2.5 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Outer glow ring */}
            <circle cx={80} cy={80} r={76} fill="none"
              stroke="rgba(255,224,102,0.08)" strokeWidth={8} />
          </svg>

          {/* Center cap — shows current speed */}
          <div style={{
            position: 'absolute',
            inset: '28%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #1e1e38, #0a0a18)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 24px rgba(255,224,102,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#ffe066', letterSpacing: '0.03em' }}>
              {SPEEDS[idx]}
            </span>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              sec
            </span>
          </div>
        </div>

        <h1 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(1.875rem, 4.5vw, 3.25rem)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          maxWidth: 540,
        }}>
          {headline}
        </h1>

        <p style={{
          margin: '0 0 40px',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.65,
          maxWidth: 420,
        }}>
          {subline}
        </p>

        <a
          href={ctaHref}
          style={{
            display: 'inline-block',
            padding: '13px 30px',
            background: '#ffe066',
            color: '#06060f',
            fontWeight: 700,
            fontSize: '0.9375rem',
            borderRadius: '100px',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'background 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = '#ffd633'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = '#ffe066'; }}
        >
          {ctaLabel}
        </a>

        <p style={{
          marginTop: 20,
          fontSize: 11,
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Drag the dial · {SPEEDS[idx]} exposure
        </p>
      </div>
    </section>
  );
}
