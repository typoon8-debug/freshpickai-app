import { cn } from "@/lib/utils";

interface BottomCTAProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomCTA({ children, className }: BottomCTAProps) {
  return <div className={cn("fixed right-0 bottom-16 left-0 p-4", className)}>{children}</div>;
}
