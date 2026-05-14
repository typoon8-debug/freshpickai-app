import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
};

export function DisplayXL({ className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "font-display text-ink-900 text-[56px] leading-[1.1] tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function DisplayL({ className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "font-display text-ink-900 text-[40px] leading-[1.15] tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function DisplayM({ className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn("font-display text-ink-900 text-[32px] leading-[1.2]", className)}
      {...props}
    />
  );
}

export function Heading({ className, ...props }: TypographyProps) {
  return (
    <h4
      className={cn(
        "font-display text-ink-900 text-[22px] leading-[1.35] tracking-[-0.5px]",
        className
      )}
      {...props}
    />
  );
}

export function Title({ className, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        "text-ink-900 text-[17px] leading-[1.3] font-bold tracking-[-0.3px]",
        className
      )}
      {...props}
    />
  );
}

export function Body({ className, ...props }: TypographyProps) {
  return <p className={cn("text-ink-700 text-base leading-relaxed", className)} {...props} />;
}

export function Caption({ className, ...props }: TypographyProps) {
  return <span className={cn("text-ink-500 text-[13px] leading-normal", className)} {...props} />;
}

export function Label({ className, ...props }: TypographyProps) {
  return (
    <span
      className={cn(
        "font-display text-ink-500 text-[10px] tracking-[var(--tracking-label)] uppercase",
        className
      )}
      {...props}
    />
  );
}
