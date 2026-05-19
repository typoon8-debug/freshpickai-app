"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  id?: string;
}

function Checkbox({ checked, onCheckedChange, disabled, className, ...props }: CheckboxProps) {
  const isChecked = checked === true;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!isChecked)}
      data-slot="checkbox"
      style={{
        backgroundColor: isChecked ? "#7c5c4a" : "transparent",
        borderColor: isChecked ? "#7c5c4a" : undefined,
      }}
      className={cn(
        "relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50",
        !isChecked && "border-input",
        className
      )}
      {...props}
    >
      {isChecked && <CheckIcon className="size-3.5 text-white" style={{ color: "#ffffff" }} />}
    </button>
  );
}

export { Checkbox };
