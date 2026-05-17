"use client";

import { motion } from "framer-motion";

const BARS = [0, 1, 2, 3];

const barVariants = {
  listening: (i: number) => ({
    scaleY: [0.4, 1, 0.4],
    transition: {
      repeat: Infinity,
      duration: 0.8,
      delay: i * 0.1,
      ease: "easeInOut" as const,
    },
  }),
  idle: {
    scaleY: 0.4,
    transition: { duration: 0.2 },
  },
};

interface SoundWaveAnimationProps {
  isActive: boolean;
  size?: number;
}

export function SoundWaveAnimation({ isActive, size = 16 }: SoundWaveAnimationProps) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-hidden="true"
      data-testid="sound-wave"
      style={{ height: size }}
    >
      {BARS.map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={barVariants}
          animate={isActive ? "listening" : "idle"}
          style={{ originY: 0.5 }}
          className="block w-0.5 rounded-full bg-red-500"
          initial={{ scaleY: 0.4, height: size }}
        />
      ))}
    </div>
  );
}
