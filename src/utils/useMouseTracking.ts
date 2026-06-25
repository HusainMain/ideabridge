import { useState, useEffect, useRef } from 'react';

export function useMouseTracking() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Normalize to -1 to 1 range
      const x = (e.clientX - centerX) / centerX;
      const y = (e.clientY - centerY) / centerY;
      targetPosRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Smooth interpolation using requestAnimationFrame
    const animate = () => {
      setMousePos(prev => ({
        x: prev.x + (targetPosRef.current.x - prev.x) * 0.1,
        y: prev.y + (targetPosRef.current.y - prev.y) * 0.1
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return mousePos;
}
