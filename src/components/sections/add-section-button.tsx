"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface AddSectionButtonProps {
  onAdd: (name: string) => void;
}

export function AddSectionButton({ onAdd }: AddSectionButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-mocha-200 text-mocha-600 hover:border-mocha-400 hover:bg-mocha-50 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm font-medium transition"
      >
        <Plus size={16} />새 섹션 추가하기
      </button>
    );
  }

  return (
    <div className="border-mocha-400 bg-mocha-50 rounded-lg border-2 px-3 py-3">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="섹션 이름 (예: 내맘대로 메뉴)"
          className="text-ink-900 placeholder:text-ink-300 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="bg-mocha-700 text-paper flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setName("");
          }}
          className="text-ink-300"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
