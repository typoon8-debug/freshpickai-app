import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="bg-paper/90 border-line sticky top-0 z-10 flex h-14 items-center border-b px-1 backdrop-blur-sm">
      {onBack && (
        <button
          onClick={onBack}
          className="text-ink-700 flex min-h-[44px] min-w-[44px] items-center justify-center"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-ink-900 flex-1 px-3 text-base font-semibold">{title}</h1>
    </header>
  );
}
