import { useMemo, useState, useCallback } from "react";
import type { GeneratedPrompt } from "../types";
import type { StatusFilter, MediaTypeFilter } from "../constants/filterConfig";

export function usePromptFilters(prompts: GeneratedPrompt[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [mediaTypeFilter, setMediaTypeFilter] =
    useState<MediaTypeFilter>("all");

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.text.toLowerCase().includes(query));
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (mediaTypeFilter !== "all") {
      filtered = filtered.filter((p) => p.mediaType === mediaTypeFilter);
    }

    return filtered;
  }, [prompts, searchQuery, statusFilter, mediaTypeFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setMediaTypeFilter("all");
  }, []);

  const hasActiveFilters =
    statusFilter !== "all" ||
    mediaTypeFilter !== "all" ||
    searchQuery.trim() !== "";

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    mediaTypeFilter,
    setMediaTypeFilter,
    filteredPrompts,
    clearFilters,
    hasActiveFilters,
  };
}
