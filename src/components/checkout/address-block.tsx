"use client";

import { MapPin, Truck, ChevronRight } from "lucide-react";

export function AddressBlock() {
  return (
    <div className="border-line overflow-hidden rounded-lg border bg-white">
      <div className="border-line flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-mocha-500" />
          <span className="text-ink-800 text-sm font-semibold">배송지</span>
        </div>
        <button type="button" className="text-mocha-600 flex items-center text-xs">
          변경 <ChevronRight size={13} />
        </button>
      </div>

      <div className="px-4 py-3">
        <p className="text-ink-900 text-sm font-semibold">집</p>
        <p className="text-ink-500 mt-1 text-sm">서울특별시 마포구 합정동 000-00</p>
        <p className="text-ink-400 text-xs">010-0000-0000</p>

        <div className="bg-mocha-50 mt-3 flex items-center gap-2 rounded-lg px-3 py-2">
          <Truck size={13} className="text-mocha-500" />
          <p className="text-ink-600 text-xs">
            <span className="text-mocha-700 font-semibold">배송 방식</span>은 스토어 정책에 따라
            다릅니다
          </p>
        </div>
      </div>
    </div>
  );
}
