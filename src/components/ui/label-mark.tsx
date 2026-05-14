import { cn } from "@/lib/utils";

interface LabelMarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export function LabelMark({ className, children, ...props }: LabelMarkProps) {
  return (
    <span
      className={cn(
        "font-display text-[10px] font-medium tracking-[2px] text-olive-500 uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
