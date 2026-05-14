"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreferenceForm } from "./PreferenceForm";
import type { PreferenceFormValues } from "./PreferenceForm";

interface PreferenceAccordionProps {
  initialValues?: Partial<PreferenceFormValues>;
  defaultOpen?: boolean;
}

export function PreferenceAccordion({
  initialValues,
  defaultOpen = false,
}: PreferenceAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-line overflow-hidden rounded-xl border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <span className="text-ink-800 text-sm font-semibold">선호 설정</span>
        <ChevronDown
          size={16}
          className={cn("text-ink-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-line border-t px-4 pt-3 pb-4">
          <PreferenceForm initialValues={initialValues} />
        </div>
      )}
    </div>
  );
}
