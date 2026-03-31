import React, { useRef, useState, useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import { motion } from 'motion/react';

export const GameViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 w-full h-full min-h-[400px] bg-ink/20 rounded-3xl overflow-hidden border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] group"
    >
      {/* Playable Area Boundary Glow */}
      <div className="absolute inset-0 border-2 border-brand-purple/10 rounded-3xl pointer-events-none group-hover:border-brand-purple/20 transition-colors duration-500" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(124,58,237,0.05)] pointer-events-none" />

      {dimensions.width > 0 && dimensions.height > 0 && (
        <GameCanvas width={dimensions.width} height={dimensions.height} />
      )}

      {/* Grid Pattern Overlay for the viewport */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    </div>
  );
};
