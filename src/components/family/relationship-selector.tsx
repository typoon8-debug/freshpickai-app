"use client";

import { cn } from "@/lib/utils";
import {
  RELATIONSHIP_CONFIG,
  RELATIONSHIP_OPTIONS,
  type RelationshipType,
} from "@/lib/constants/relationship";

interface RelationshipSelectorProps {
  value: RelationshipType | null;
  onChange: (value: RelationshipType) => void;
  className?: string;
}

export function RelationshipSelector({ value, onChange, className }: RelationshipSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {RELATIONSHIP_OPTIONS.map((rel) => {
        const { label, emoji } = RELATIONSHIP_CONFIG[rel];
        const selected = value === rel;
        return (
          <button
            key={rel}
            type="button"
            onClick={() => onChange(rel)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}
          >
            <span className="text-2xl leading-none">{emoji}</span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
