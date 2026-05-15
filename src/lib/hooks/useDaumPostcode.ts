"use client";

import { useEffect, useState } from "react";

const SRC = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export function useDaumPostcode() {
  const [isReady, setIsReady] = useState(typeof window !== "undefined" && !!window.daum?.Postcode);

  useEffect(() => {
    if (isReady) return;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setIsReady(true), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);
  }, [isReady]);

  return isReady;
}
