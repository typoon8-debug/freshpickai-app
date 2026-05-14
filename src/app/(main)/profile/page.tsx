import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildPersonaContext, PERSONA_NAMES } from "@/lib/ai/persona-context";
import { PreferenceForm } from "@/components/profile/PreferenceForm";
import { resetOnboardingAction } from "@/lib/actions/auth/onboarding";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [ctx, prefData] = await Promise.all([
    buildPersonaContext(user.id),
    supabase
      .from("fp_user_preference")
      .select("dietary_tags, persona_tags, cook_time_min, budget_level")
      .eq("user_id", user.id)
      .single(),
  ]);

  const { data: profile } = await supabase
    .from("fp_user_profile")
    .select("display_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  const personaTags: string[] = prefData.data?.persona_tags ?? [];
  const householdTag = personaTags.find((t) => t.startsWith("household:"));
  const skillTag = personaTags.find((t) => t.startsWith("skill:"));
  const shopTimeTag = personaTags.find((t) => t.startsWith("shop_time:"));

  const householdSize = householdTag ? parseInt(householdTag.split(":")[1]) || 3 : 3;
  const rawSkill = skillTag?.split(":")[1];
  const cookingSkill =
    rawSkill === "beginner" || rawSkill === "advanced" ? rawSkill : ("intermediate" as const);
  const rawShopTime = shopTimeTag?.split(":")[1];
  const preferredShoppingTime =
    rawShopTime === "morning" || rawShopTime === "evening" ? rawShopTime : ("afternoon" as const);

  return (
    <div className="min-h-screen pb-8">
      {/* 헤더 */}
      <div className="bg-mocha-50 px-4 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-mocha-200 flex h-16 w-16 items-center justify-center rounded-full text-2xl">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="프로필"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div>
            <p className="text-ink-700 text-lg font-bold">{profile?.display_name ?? "사용자"}</p>
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

      {/* 선호 설정 */}
      <div className="px-4 pt-6">
        <h2 className="text-ink-700 mb-4 text-base font-bold">선호 설정</h2>
        <PreferenceForm
          data-testid="preference-form"
          initialValues={{
            dietaryTags: prefData.data?.dietary_tags ?? [],
            cookingSkill,
            preferredShoppingTime,
            householdSize,
          }}
        />
      </div>

      {/* 온보딩 다시 보기 */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-ink-700 mb-3 text-base font-bold">서비스 안내</h2>
        <form action={resetOnboardingAction}>
          <button
            type="submit"
            className="border-line text-ink-600 hover:bg-mocha-50 w-full rounded-xl border px-4 py-3 text-left text-sm transition"
            data-testid="onboarding-reset-button"
          >
            <span className="font-medium">온보딩 다시 보기</span>
            <span className="text-ink-400 ml-2 text-xs">
              서비스 소개 슬라이드를 다시 볼 수 있어요
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
