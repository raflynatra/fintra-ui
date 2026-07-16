import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Category, CategoryType } from "@/features/categories/types";

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: () =>
      apiClient.get<Category[]>("/api/categories", {
        params: type ? { type } : undefined,
      }),
    // Categories are pre-seeded system defaults; nothing in this app
    // mutates them yet, so there's no reason to ever refetch.
    staleTime: Infinity,
  });
}
