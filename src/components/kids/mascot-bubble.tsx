"use client";

import { motion } from "framer-motion";

interface MascotBubbleProps {
  message?: string;
}

export function MascotBubble({ message = "오늘 뭐 먹고 싶어? 골라봐! 🥰" }: MascotBubbleProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* 말풍선 */}
      <div className="bg-mocha-50 relative rounded-2xl px-4 py-2.5 text-center">
        <p className="text-ink-700 text-sm font-medium">{message}</p>
        {/* 말풍선 꼬리 */}
        <div className="bg-mocha-50 absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45" />
      </div>

      {/* 마스코트 */}
      <motion.div
        animate={{ y: [0, -14, 2, -6, 0] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          repeatDelay: 0.6,
          times: [0, 0.4, 0.6, 0.8, 1],
          ease: ["easeOut", "easeIn", "easeOut", "easeIn", "easeOut"],
        }}
        className="bg-mocha-100 flex h-20 w-20 items-center justify-center rounded-full text-5xl"
      >
        🐰
      </motion.div>
    </div>
  );
}
