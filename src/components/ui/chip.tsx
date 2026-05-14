"use client";

import { cn } from "@/lib/utils";

interface ChipProps {
  label?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "filled" | "outline";
  children?: React.ReactNode;
}

export function Chip({
  label,
  active = false,
  onClick,
  className,
  size = "md",
  variant = "filled",
  children,
}: ChipProps) {
  const cls = cn(
    "rounded-pill inline-flex items-center font-medium transition-colors",
    size === "md" && "min-h-[44px] px-4 text-sm",
    size === "sm" && "px-2.5 py-1 text-xs",
    variant === "filled" &&
      (active
        ? "bg-olive-100 text-olive-700 ring-1 ring-olive-500/30"
        : "bg-mocha-50 text-ink-500 ring-line ring-1"),
    variant === "outline" &&
      (active
        ? "border-primary bg-primary/10 text-primary border"
        : "border-border text-muted-foreground border bg-transparent"),
    className
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children ?? label}
      </button>
    );
  }

  return <span className={cls}>{children ?? label}</span>;
}
