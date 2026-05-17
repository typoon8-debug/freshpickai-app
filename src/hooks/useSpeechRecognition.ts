"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type SpeechState = "idle" | "listening" | "processing" | "error";

export interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  state: SpeechState;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  /** 음성 전송 완료 후 idle 복귀용 — chat-input에서 onSend 후 호출 */
  resetAfterSend: () => void;
}

// Web Speech API 타입 (lib.dom.d.ts에 미포함된 webkit 확장)
interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onresult: ((ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((ev: ISpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

function getSpeechRecognitionConstructor(): (new () => ISpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const mountedRef = useRef(true);
  // lazy initializer: SSR에서는 false, 클라이언트 마운트 시 즉시 결정
  const [isSupported] = useState(() => getSpeechRecognitionConstructor() !== null);

  const startListening = useCallback(() => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) return;

    // 이미 실행 중이면 중지
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    setError(null);
    setTranscript("");
    setInterimTranscript("");

    const recognition = new Constructor();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState("listening");
    };

    recognition.onresult = (ev: ISpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
        setState("processing");
      }
    };

    recognition.onerror = (ev: ISpeechRecognitionErrorEvent) => {
      if (!mountedRef.current) return;
      // 사용자가 직접 중지한 경우는 에러로 처리하지 않음
      if (ev.error === "aborted" || ev.error === "no-speech") {
        setState("idle");
      } else {
        setError(ev.error);
        setState("error");
      }
      setInterimTranscript("");
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;
      recognitionRef.current = null;
      // processing 상태인 경우 useEffect가 onSend를 처리한 뒤 resetAfterSend로 idle 복귀
      // listening 상태인 경우(결과 없이 종료) idle로 복귀
      setState((prev) => (prev === "listening" ? "idle" : prev));
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState("idle");
    setTranscript("");
    setInterimTranscript("");
  }, []);

  /** 음성 전송 완료 후 idle 복귀 — processing 상태를 해제 */
  const resetAfterSend = useCallback(() => {
    setState("idle");
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    state,
    isListening: state === "listening",
    isSupported,
    error,
    startListening,
    stopListening,
    resetAfterSend,
  };
}
