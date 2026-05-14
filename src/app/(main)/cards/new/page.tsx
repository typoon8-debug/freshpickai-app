"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/layout/page-header";
import { WizardProgress } from "@/components/wizard/wizard-progress";
import { Step1Theme } from "@/components/wizard/steps/step1-theme";
import { Step2Tags } from "@/components/wizard/steps/step2-tags";
import { Step3Ingredients } from "@/components/wizard/steps/step3-ingredients";
import { Step4Preview } from "@/components/wizard/steps/step4-preview";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { cardWizardSchema, type CardWizardValues } from "@/lib/validations/card-wizard";
import { createCardAction } from "@/lib/actions/cards/create";

const TOTAL_STEPS = 4;

const STEP_FIELDS: Record<number, (keyof CardWizardValues)[]> = {
  1: ["theme"],
  2: ["tags"],
  3: ["ingredients", "budget"],
};

export default function NewCardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CardWizardValues>({
    resolver: zodResolver(cardWizardSchema),
    mode: "onTouched",
    defaultValues: {
      tags: [],
      ingredients: [],
      budget: "",
      cardName: "",
      submitForReview: false,
      aiConsent: false,
    },
  });

  const theme = useWatch({ control: form.control, name: "theme" });
  const tags = useWatch({ control: form.control, name: "tags" }) ?? [];
  const ingredients = useWatch({ control: form.control, name: "ingredients" }) ?? [];
  const budget = useWatch({ control: form.control, name: "budget" }) ?? "";
  const cardName = useWatch({ control: form.control, name: "cardName" }) ?? "";
  const submitForReview = useWatch({ control: form.control, name: "submitForReview" }) ?? false;
  const aiConsent = useWatch({ control: form.control, name: "aiConsent" }) ?? false;
  const { errors } = form.formState;

  const canNext =
    step === 1
      ? !!theme
      : step === 2
        ? tags.length >= 3
        : step === 3
          ? ingredients.length > 0
          : true;

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    setStep((s) => s + 1);
  };

  const handleSave = form.handleSubmit(async (values) => {
    setIsSaving(true);
    const result = await createCardAction(values);
    setIsSaving(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.push("/");
  });

  return (
    <>
      <PageHeader title="카드 만들기" />
      <WizardProgress currentStep={step} />

      <div className="px-4 pt-2 pb-32">
        {step === 1 && (
          <>
            <Step1Theme
              selected={theme ?? null}
              onChange={(v) => form.setValue("theme", v, { shouldValidate: true })}
            />
            {errors.theme && <p className="text-terracotta mt-2 text-xs">테마를 선택해 주세요</p>}
          </>
        )}
        {step === 2 && (
          <>
            <Step2Tags
              selected={tags}
              onChange={(v) => form.setValue("tags", v, { shouldValidate: true })}
            />
            {errors.tags && (
              <p className="text-terracotta mt-2 text-xs">
                {errors.tags.message ?? "취향 태그를 최소 3개 선택해 주세요"}
              </p>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <Step3Ingredients
              ingredients={ingredients}
              budget={budget}
              onIngredientsChange={(v) => form.setValue("ingredients", v, { shouldValidate: true })}
              onBudgetChange={(v) => form.setValue("budget", v, { shouldValidate: true })}
            />
            {(errors.ingredients || errors.budget) && (
              <p className="text-terracotta mt-2 text-xs">
                {errors.ingredients?.message ?? errors.budget?.message}
              </p>
            )}
          </>
        )}
        {step === 4 && (
          <Step4Preview
            cardName={cardName}
            theme={theme ?? null}
            tags={tags}
            budget={budget}
            submitForReview={submitForReview}
            aiConsent={aiConsent}
            onCardNameChange={(v) => form.setValue("cardName", v)}
            onSubmitForReviewChange={(v) => form.setValue("submitForReview", v)}
            onAiConsentChange={(v) => form.setValue("aiConsent", v)}
          />
        )}
      </div>

      <WizardFooter
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        canNext={canNext}
        isSaving={isSaving}
        onPrev={() => setStep((s) => s - 1)}
        onNext={handleNext}
        onSave={handleSave}
      />
    </>
  );
}
