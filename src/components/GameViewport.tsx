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
      className="relative flex-1 w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-border group shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(163,255,0,0.05)] transition-all duration-500"
    >
      {/* Radial Gradient Background: Dark focus center, brighter vignette focus zone */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-card)_0%,var(--color-background)_100%)] pointer-events-none z-0" />
      
      {/* Subtle Glowing Container Edges */}
      <div className="absolute inset-0 border-[3px] border-primary/20 rounded-3xl pointer-events-none group-hover:border-primary/40 transition-colors duration-500 z-10" />
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(163,255,0,0.05)] group-hover:shadow-[inset_0_0_150px_rgba(163,255,0,0.1)] pointer-events-none transition-shadow duration-700 z-10" />

      {/* Animated Vertical Grid Overlay */}
      <motion.div 
        animate={{ y: [0, 40] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute -top-10 bottom-0 left-0 right-0 pointer-events-none z-10 opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-muted) 1px, transparent 1px), linear-gradient(to bottom, var(--color-muted) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-20 w-full h-full">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <GameCanvas width={dimensions.width} height={dimensions.height} />
        )}
      </div>
    </div>
  );
};
