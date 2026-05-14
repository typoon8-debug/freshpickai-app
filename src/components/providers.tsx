"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/query-client";
import { AuthSync } from "@/components/auth/auth-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <AuthSync />
        {children}
        <Toaster position="bottom-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
