"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SectionItem } from "./section-item";
import type { CardSection } from "@/lib/types";

const ITEM_HEIGHT = 64;

interface SectionListProps {
  sections: CardSection[];
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  onRename: (sectionId: string, name: string) => void;
  onToggleAI: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
}

export function SectionList({
  sections,
  onMoveUp,
  onMoveDown,
  onRename,
  onToggleAI,
  onDelete,
}: SectionListProps) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const activeIdxRef = useRef<number | null>(null);

  const handlePointerDown = useCallback((idx: number, e: React.PointerEvent<HTMLSpanElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    activeIdxRef.current = idx;
    setDraggingIdx(idx);
    setDragY(0);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>, sectionsLength: number) => {
      if (activeIdxRef.current === null) return;
      const dy = e.clientY - startY.current;
      setDragY(dy);
      const cur = activeIdxRef.current;
      if (dy < -(ITEM_HEIGHT / 2) && cur > 0) {
        onMoveUp(cur);
        activeIdxRef.current = cur - 1;
        setDraggingIdx(cur - 1);
        startY.current = e.clientY;
        setDragY(0);
      } else if (dy > ITEM_HEIGHT / 2 && cur < sectionsLength - 1) {
        onMoveDown(cur);
        activeIdxRef.current = cur + 1;
        setDraggingIdx(cur + 1);
        startY.current = e.clientY;
        setDragY(0);
      }
    },
    [onMoveUp, onMoveDown]
  );

  const handlePointerUp = useCallback(() => {
    activeIdxRef.current = null;
    setDraggingIdx(null);
    setDragY(0);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section, idx) => (
        <motion.div
          key={section.sectionId}
          animate={{
            y: draggingIdx === idx ? dragY : 0,
            scale: draggingIdx === idx ? 1.02 : 1,
          }}
          style={{
            position: "relative",
            zIndex: draggingIdx === idx ? 10 : 0,
            boxShadow: draggingIdx === idx ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
          }}
          transition={
            draggingIdx === idx ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }
          }
        >
          <SectionItem
            section={section}
            index={idx}
            total={sections.length}
            isDragging={draggingIdx === idx}
            onMoveUp={() => onMoveUp(idx)}
            onMoveDown={() => onMoveDown(idx)}
            onRename={(name) => onRename(section.sectionId, name)}
            onToggleAI={() => onToggleAI(section.sectionId)}
            onDelete={() => onDelete(section.sectionId)}
            onHandlePointerDown={(e) => handlePointerDown(idx, e)}
            onHandlePointerMove={(e) => handlePointerMove(e, sections.length)}
            onHandlePointerUp={handlePointerUp}
          />
        </motion.div>
      ))}
    </div>
  );
}
