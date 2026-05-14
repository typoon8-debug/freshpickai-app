import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  label?: string;
  highlight?: boolean;
  className?: string;
}

export function AIBadge({ label = "AI 추천", highlight = false, className }: AIBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-pill inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold",
        highlight ? "bg-honey text-mocha-900" : "bg-olive-100 text-olive-700",
        className
      )}
    >
      <Sparkles size={10} />
      {label}
    </span>
  );
}
