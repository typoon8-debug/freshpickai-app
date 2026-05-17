"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Vote } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createPoll } from "@/lib/actions/family/poll";
import type { PollType } from "@/lib/types";

const DEADLINE_OPTIONS = [
  { value: "2", label: "2시간 후" },
  { value: "8", label: "8시간 후" },
  { value: "24", label: "24시간 후" },
  { value: "48", label: "48시간 후" },
] as const;

const schema = z.object({
  title: z.string().min(1, "투표 제목을 입력하세요").max(60, "60자 이하로 입력하세요"),
  options: z
    .array(z.object({ label: z.string().min(1, "항목을 입력하세요"), emoji: z.string() }))
    .min(2, "최소 2개 항목이 필요합니다")
    .max(5, "최대 5개까지 가능합니다"),
  deadlineHours: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface PollCreateSheetProps {
  groupId: string;
  pollType?: PollType;
  initialTitle?: string;
  initialOptions?: { label: string; emoji: string }[];
  onCreated?: () => void;
  trigger?: React.ReactElement;
}

const EMOJI_DEFAULTS = ["🍽", "🎬", "🏕", "🎮", "🛒"];

function getDeadline(hours: string): Date {
  const ms = Number(hours) * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

export function PollCreateSheet({
  groupId,
  pollType = "general",
  initialTitle = "",
  initialOptions,
  onCreated,
  trigger,
}: PollCreateSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultOptions = initialOptions ?? [
    { label: "", emoji: "🍽" },
    { label: "", emoji: "🎬" },
  ];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: initialTitle, options: defaultOptions, deadlineHours: "24" },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const selectedDeadline = watch("deadlineHours");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const endsAt = getDeadline(values.deadlineHours);
    const options = values.options.map((o, i) => ({
      id: String(i + 1),
      label: o.label,
      emoji: o.emoji || EMOJI_DEFAULTS[i] || "📌",
    }));

    const result = await createPoll({ groupId, title: values.title, options, endsAt, pollType });
    setLoading(false);

    if (!result.ok) {
      toast.error("투표 생성 실패");
      return;
    }

    toast.success("투표가 생성됐어요! 가족에게 알림을 보냈어요 🗳");
    reset();
    setOpen(false);
    onCreated?.();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          trigger ?? (
            <Button variant="outline" size="sm" className="gap-1.5">
              <Vote className="h-4 w-4" />
              투표 만들기
            </Button>
          )
        }
      />

      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl pb-10">
        <SheetHeader className="mb-4">
          <SheetTitle>새 투표 만들기 🗳</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 투표 제목 */}
          <div className="space-y-1.5">
            <Label htmlFor="poll-title">투표 제목 *</Label>
            <Input
              id="poll-title"
              placeholder="예: 이번 주말 저녁 뭐 먹을까?"
              {...register("title")}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          {/* 선택 항목 */}
          <div className="space-y-2">
            <Label>선택 항목 (최대 5개)</Label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 shrink-0 text-sm">{index + 1}.</span>
                  <Input
                    className="w-14 shrink-0 text-center"
                    maxLength={2}
                    placeholder="😊"
                    {...register(`options.${index}.emoji`)}
                  />
                  <Input
                    className="flex-1"
                    placeholder={`선택지 ${index + 1}`}
                    {...register(`options.${index}.label`)}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="text-destructive text-xs">
                {errors.options.message ?? "항목을 확인해주세요"}
              </p>
            )}
            {fields.length < 5 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => append({ label: "", emoji: EMOJI_DEFAULTS[fields.length] ?? "📌" })}
              >
                <Plus className="h-3.5 w-3.5" />
                항목 추가
              </Button>
            )}
          </div>

          {/* 마감 시간 */}
          <div className="space-y-2">
            <Label>마감 시간</Label>
            <Controller
              control={control}
              name="deadlineHours"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-4 gap-2"
                >
                  {DEADLINE_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center">
                      <RadioGroupItem
                        value={opt.value}
                        id={`deadline-${opt.value}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`deadline-${opt.value}`}
                        className={[
                          "flex w-full cursor-pointer items-center justify-center rounded-lg border p-2 text-center text-xs transition-colors",
                          selectedDeadline === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input hover:bg-accent",
                        ].join(" ")}
                      >
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "생성 중…" : "투표 시작 🔔"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
