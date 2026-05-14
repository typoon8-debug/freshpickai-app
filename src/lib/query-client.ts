import { QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10분 — 자주 바뀌지 않는 카드/섹션 데이터
        gcTime: 30 * 60 * 1000, // 30분 — 캐시 보관 시간 연장으로 재탐색 시 즉각 표시
        retry: 1,
        refetchOnWindowFocus: false, // 탭 전환 시 불필요한 재요청 방지
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** 서버/클라이언트 환경에 맞는 QueryClient 반환 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
