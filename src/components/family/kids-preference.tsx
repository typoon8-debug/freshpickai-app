import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface KidsPref {
  emoji: string;
  name: string;
  stars: number;
  comment: string;
}

const MOCK_KIDS_PREFS: KidsPref[] = [
  { emoji: "🍗", name: "치킨", stars: 5, comment: "최고야!" },
  { emoji: "🍕", name: "피자", stars: 4, comment: "또 먹고 싶어" },
  { emoji: "🥦", name: "브로콜리", stars: 2, comment: "별로야..." },
];

export function KidsPreference() {
  return (
    <section className="px-4">
      <h3 className="text-ink-700 mb-3 text-sm font-semibold">하준이 선호 🧒</h3>
      <div className="border-line overflow-hidden rounded-lg border bg-white">
        {MOCK_KIDS_PREFS.map((pref, idx) => (
          <div
            key={pref.name}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              idx < MOCK_KIDS_PREFS.length - 1 && "border-line border-b"
            )}
          >
            <span className="text-xl">{pref.emoji}</span>
            <div className="flex-1">
              <p className="text-ink-800 text-sm font-medium">{pref.name}</p>
              <p className="text-ink-400 text-xs">&ldquo;{pref.comment}&rdquo;</p>
            </div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < pref.stars ? "fill-honey text-honey" : "text-ink-200"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
