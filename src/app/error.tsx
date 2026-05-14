"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-terracotta text-5xl">!</p>
      <h1 className="text-ink-900 mt-4 text-xl font-semibold">문제가 발생했어요</h1>
      <p className="text-ink-500 mt-2 text-sm">{error.message || "잠시 후 다시 시도해 주세요."}</p>
      <button
        onClick={reset}
        className="rounded-pill bg-mocha-700 text-paper mt-8 px-6 py-3 text-sm font-semibold"
      >
        다시 시도
      </button>
    </div>
  );
}
