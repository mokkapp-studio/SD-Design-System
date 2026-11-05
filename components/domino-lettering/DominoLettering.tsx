import { useEffect, useRef, useState } from 'react';

export interface DominoLetteringProps {
  text: string;
  trigger?: 'hover' | 'click' | 'mount' | 'none';
  speed?: number;
  stagger?: number;
  direction?: 'forward' | 'backward';
  playing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function DominoLettering({
  text,
  trigger = 'hover',
  speed = 400,
  stagger = 60,
  direction = 'forward',
  playing: externalPlaying,
  className,
  style,
}: DominoLetteringProps) {
  const letters = [...text];
  const [tipped, setTipped] = useState<boolean[]>(() => Array(letters.length).fill(false));
  const activeRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function play() {
    if (activeRef.current) return;
    activeRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const order = direction === 'backward'
      ? letters.map((_, i) => letters.length - 1 - i)
      : letters.map((_, i) => i);

    order.forEach((letterIdx, seq) => {
      const fall = setTimeout(() => {
        setTipped(prev => { const n = [...prev]; n[letterIdx] = true; return n; });
      }, seq * stagger);

      const rise = setTimeout(() => {
        setTipped(prev => { const n = [...prev]; n[letterIdx] = false; return n; });
        if (seq === order.length - 1) activeRef.current = false;
      }, seq * stagger + speed);

      timersRef.current.push(fall, rise);
    });
  }

  // Controlled via `playing` prop (trigger=none)
  useEffect(() => {
    if (trigger === 'none' && externalPlaying) play();
  }, [externalPlaying]);

  // Auto-play on mount
  useEffect(() => {
    if (trigger === 'mount') play();
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handlers =
    trigger === 'hover' ? { onMouseEnter: play } :
    trigger === 'click' ? { onClick: play, role: 'button' as const, tabIndex: 0,
      onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') play(); } } :
    {};

  return (
    <span
      className={className}
      style={{ display: 'inline-block', perspective: '400px', cursor: trigger === 'click' ? 'pointer' : undefined, ...style }}
      {...handlers}
    >
      {letters.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            transformStyle: 'preserve-3d',
            transform: tipped[i] ? 'rotateX(90deg)' : 'rotateX(0deg)',
            transition: `transform ${speed}ms ease`,
            whiteSpace: char === ' ' ? 'pre' : undefined,
          }}
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}
