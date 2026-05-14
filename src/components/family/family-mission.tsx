import { Film, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Mission {
  id: string;
  icon: string;
  title: string;
  desc: string;
  cta?: string;
  ctaHref?: string;
}

const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1",
    icon: "🥗",
    title: "이번 주 채소 도전!",
    desc: "4가지 채소 요리 도전 중 → 3/4 완료",
    cta: "레시피 보기",
    ctaHref: "/cards/c07",
  },
  {
    id: "m2",
    icon: "🎬",
    title: "금요일 홈시네마 나이트",
    desc: "팝콘 + 나초 + 치킨 조합 세트",
    cta: "카드 보기",
    ctaHref: "/cards/c10",
  },
];

export function FamilyMission() {
  return (
    <section className="px-4">
      <div className="mb-3 flex items-center gap-2">
        <Film size={15} className="text-mocha-500" />
        <h3 className="text-ink-700 text-sm font-semibold">이번 주 미션</h3>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_MISSIONS.map((mission) => (
          <div key={mission.id} className="border-line overflow-hidden rounded-lg border bg-white">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-2xl">{mission.icon}</span>
              <div className="flex-1">
                <p className="text-ink-900 text-sm font-semibold">{mission.title}</p>
                <p className="text-ink-500 mt-0.5 text-xs">{mission.desc}</p>
              </div>
              {mission.ctaHref && (
                <Link
                  href={mission.ctaHref}
                  className="text-mocha-700 flex items-center text-xs font-medium"
                >
                  {mission.cta}
                  <ChevronRight size={13} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
