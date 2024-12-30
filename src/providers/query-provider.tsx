"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimize caching behavior
            staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
            gcTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: "always", // Always refetch on reconnect
            retry: 3, // Retry failed requests 3 times
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 2,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
} 