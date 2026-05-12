"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { signInWithEmail } from "@/lib/actions/auth/session";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

type FormValues = z.infer<typeof schema>;

interface EmailLoginFormProps {
  onBack: () => void;
  className?: string;
}

export function EmailLoginForm({ onBack, className }: EmailLoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await signInWithEmail(data.email, data.password);
      if (result.error) throw new Error(result.error);
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "로그인에 실패했어요.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <button
        type="button"
        onClick={onBack}
        className="text-ink-500 hover:text-ink-700 flex items-center gap-1 text-sm"
      >
        <ChevronLeft size={16} />
        다른 방법으로 로그인
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-ink-700 text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="hello@example.com"
            {...register("email")}
            className={cn(
              "border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 h-12 w-full rounded border px-3 text-sm transition outline-none",
              errors.email && "border-terracotta focus:border-terracotta"
            )}
          />
          {errors.email && <p className="text-terracotta text-xs">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-ink-700 text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="6자 이상"
            {...register("password")}
            className={cn(
              "border-line text-ink-900 placeholder:text-ink-300 focus:border-mocha-500 h-12 w-full rounded border px-3 text-sm transition outline-none",
              errors.password && "border-terracotta focus:border-terracotta"
            )}
          />
          {errors.password && <p className="text-terracotta text-xs">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-1 w-full disabled:opacity-60"
        >
          {isSubmitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
}
