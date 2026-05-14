import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-mocha-300 text-6xl">404</p>
      <h1 className="text-ink-900 mt-4 text-xl font-semibold">페이지를 찾을 수 없어요</h1>
      <p className="text-ink-500 mt-2 text-sm">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        href="/"
        className="rounded-pill bg-mocha-700 text-paper mt-8 px-6 py-3 text-sm font-semibold"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
