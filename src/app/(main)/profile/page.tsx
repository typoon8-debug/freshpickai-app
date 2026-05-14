import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Coins, TicketPercent, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildPersonaContext, PERSONA_NAMES } from "@/lib/ai/persona-context";
import { PreferenceAccordion } from "@/components/profile/preference-accordion";
import { getProfileStatsAction } from "@/lib/actions/profile";
import { signOutAction } from "@/lib/actions/auth/signout";
import { resetOnboardingAction } from "@/lib/actions/auth/onboarding";
import type { CookingSkill, ShoppingTime } from "@/lib/ai/persona-context";

const MENU_ITEMS = [
  { href: "/profile/my-store", label: "내가게" },
  { href: "/wishlist", label: "찜 목록" },
  { href: "/profile/orders", label: "주문/배송조회" },
  { href: "/profile/reviews", label: "구매후기" },
  { href: "/profile/addresses", label: "주소관리" },
  { href: "/profile/coupons", label: "쿠폰함" },
] as const;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [ctx, prefData, profile, stats] = await Promise.all([
    buildPersonaContext(user.id),
    supabase
      .from("fp_user_preference")
      .select("dietary_tags, persona_tags, cook_time_min, budget_level")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("fp_user_profile")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single(),
    getProfileStatsAction(),
  ]);

  const personaTags: string[] = prefData.data?.persona_tags ?? [];
  const dietaryTags: string[] = prefData.data?.dietary_tags ?? [];
  const householdTag = personaTags.find((t) => t.startsWith("household:"));
  const skillTag = personaTags.find((t) => t.startsWith("skill:"));
  const shopTimeTag = personaTags.find((t) => t.startsWith("shop_time:"));

  const householdSize = householdTag ? parseInt(householdTag.split(":")[1]) || 3 : 3;
  const rawSkill = skillTag?.split(":")[1];
  const cookingSkill: CookingSkill =
    rawSkill === "beginner" || rawSkill === "advanced" ? rawSkill : "intermediate";
  const rawShopTime = shopTimeTag?.split(":")[1];
  const preferredShoppingTime: ShoppingTime =
    rawShopTime === "morning" || rawShopTime === "evening" ? rawShopTime : "afternoon";

  return (
    <div className="min-h-screen pb-12">
      {/* 프로필 헤더 */}
      <div className="bg-mocha-50 px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-mocha-200 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl">
            {profile.data?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.data.avatar_url}
                alt="프로필"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div>
            <p className="text-ink-800 text-base font-bold">
              {profile.data?.display_name ?? "사용자"}
            </p>
            <p className="text-ink-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* 페르소나 배지 */}
        <div className="mt-4 rounded-xl bg-white px-4 py-3 shadow-sm" data-testid="persona-badge">
          <p className="text-ink-400 text-xs font-medium">나의 페르소나</p>
          <p className="text-mocha-700 text-base font-bold">{PERSONA_NAMES[ctx.personaId]}</p>
          <p className="text-ink-500 mt-0.5 text-xs">{ctx.personaDescription}</p>
        </div>
      </div>

      {/* 포인트 / 쿠폰 카드 */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="border-line flex flex-col gap-1 rounded-xl border bg-white px-4 py-3">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-mocha-500" />
            <span className="text-ink-500 text-xs">보유 포인트</span>
          </div>
          <p className="text-mocha-700 text-lg font-bold">
            {stats.pointBalance.toLocaleString()}
            <span className="text-ink-400 ml-0.5 text-sm font-normal">P</span>
          </p>
        </div>
        <div className="border-line flex flex-col gap-1 rounded-xl border bg-white px-4 py-3">
          <div className="flex items-center gap-1.5">
            <TicketPercent size={14} className="text-mocha-500" />
            <span className="text-ink-500 text-xs">사용 가능 쿠폰</span>
          </div>
          <p className="text-mocha-700 text-lg font-bold">
            {stats.couponCount.toLocaleString()}
            <span className="text-ink-400 ml-0.5 text-sm font-normal">장</span>
          </p>
        </div>
      </div>

      {/* 선호 설정 아코디언 */}
      <div className="px-4 pt-4">
        <PreferenceAccordion
          defaultOpen={true}
          initialValues={{
            dietaryTags,
            cookingSkill,
            preferredShoppingTime,
            householdSize,
          }}
        />
      </div>

      {/* 메뉴 목록 */}
      <div className="border-line mx-4 mt-4 overflow-hidden rounded-xl border bg-white">
        {MENU_ITEMS.map((item, idx) => (
          <Link
            key={item.href}
            href={item.href}
            className={`hover:bg-mocha-50 flex items-center justify-between px-4 py-3.5 transition ${
              idx < MENU_ITEMS.length - 1 ? "border-line border-b" : ""
            }`}
          >
            <span className="text-ink-700 text-sm">{item.label}</span>
            <ChevronRight size={15} className="text-ink-300" />
          </Link>
        ))}

        {/* 온보딩 다시보기 */}
        <form action={resetOnboardingAction} className="border-line border-t">
          <button
            type="submit"
            data-testid="onboarding-reset-button"
            className="hover:bg-mocha-50 flex w-full items-center justify-between px-4 py-3.5 text-left transition"
          >
            <span className="text-ink-700 text-sm">온보딩 다시보기</span>
            <ChevronRight size={15} className="text-ink-300" />
          </button>
        </form>
      </div>

      {/* 로그아웃 */}
      <div className="px-4 pt-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="border-line text-terracotta flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3.5 text-sm font-medium transition hover:bg-red-50"
          >
            <LogOut size={15} />
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}
