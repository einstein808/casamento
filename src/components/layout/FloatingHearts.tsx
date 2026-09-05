'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartParticle {
  id: number;
  left: number; // percentage
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  sway: number; // px
  color: string;
  initialY: number; // percentage from top to start immediately visible
}

const HEART_COLORS = [
  '#E0A899', // Rose gold
  '#C2847A', // Terracotta rose
  '#F0D5CE', // Soft blush
  '#FFFFFF', // Pure white
  '#E8B4B8', // Pastel pink
  '#D9C5B2', // Warm champagne
];

export function FloatingHearts({ count = 15, className = '' }: { count?: number; className?: string }) {
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  useEffect(() => {
    // Generate deterministic particles with varied speeds, sizes and positions
    const items: HeartParticle[] = Array.from({ length: count }, (_, i) => {
      const left = ((i * 100) / count + Math.sin(i * 99) * 4 + 3) % 94 + 3;
      const size = 14 + (i % 5) * 4; // 14px to 30px
      const duration = 7 + (i % 6) * 1.5; // 7s to 15s
      const delay = (i * 0.8) % 6; // staggered delays
      const sway = 15 + (i % 4) * 10;
      const color = HEART_COLORS[i % HEART_COLORS.length];
      // Randomize initial vertical offset so screen is already full of hearts on mount
      const initialY = (i * (100 / count)) % 100;

      return {
        id: i,
        left,
        size,
        duration,
        delay,
        sway,
        color,
        initialY,
      };
    });

    setParticles(items);
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 w-full h-full ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '-40px',
          }}
          initial={{
            y: 0,
            x: 0,
            opacity: 0,
            scale: 0.6,
            rotate: 0,
          }}
          animate={{
            y: ['0px', '-120vh'],
            x: [0, p.sway, -p.sway, p.sway * 0.5, 0],
            opacity: [0, 0.75, 0.95, 0.7, 0],
            scale: [0.7, 1.15, 1, 0.85],
            rotate: [-15, 15, -10, 10, -5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          <Heart
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              color: p.color,
              fill: p.color,
              filter: `drop-shadow(0 2px 8px ${p.color}80)`,
              opacity: 0.85,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
