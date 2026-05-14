import { Bell, Settings } from "lucide-react";

export function BrandHeader() {
  return (
    <header className="bg-paper/90 border-line sticky top-0 z-10 flex h-14 items-center border-b px-4 backdrop-blur-sm">
      <span className="font-display text-mocha-700 flex-1 text-lg">FreshPick AI</span>
      <div className="flex items-center">
        <button
          className="text-ink-500 flex min-h-[44px] min-w-[44px] items-center justify-center"
          aria-label="알림"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className="text-ink-500 flex min-h-[44px] min-w-[44px] items-center justify-center"
          aria-label="설정"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
