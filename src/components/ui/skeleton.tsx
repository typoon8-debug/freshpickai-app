import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-mocha-100 animate-pulse rounded-md", className)} {...props} />;
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-card shadow-card flex flex-col gap-3 rounded-xl p-4", className)}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="rounded-pill h-6 w-14" />
        <Skeleton className="rounded-pill h-6 w-14" />
      </div>
    </div>
  );
}

function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

function DailyHeroSkeleton() {
  return (
    <div className="bg-card shadow-card overflow-hidden rounded-2xl">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="rounded-pill mt-1 h-9 w-28" />
      </div>
    </div>
  );
}

function AIRecommendSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="rounded-pill h-8 w-24 flex-shrink-0" />
        ))}
      </div>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-40 flex-shrink-0 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function HomeBoardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="rounded-pill h-8 w-20 flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  TextSkeleton,
  DailyHeroSkeleton,
  AIRecommendSkeleton,
  HomeBoardSkeleton,
};
