import { useState, useCallback } from "react";

export function usePromptSelection() {
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(
    new Set(),
  );
  const [enabledPrompts, setEnabledPrompts] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleEnabled = useCallback((id: string) => {
    setEnabledPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((promptIds: string[]) => {
    setSelectedPrompts((prev) =>
      prev.size === promptIds.length ? new Set() : new Set(promptIds),
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedPrompts(new Set()), []);

  const isSelected = useCallback(
    (id: string) => selectedPrompts.has(id),
    [selectedPrompts],
  );

  const isEnabled = useCallback(
    (id: string) => !enabledPrompts.has(id),
    [enabledPrompts],
  );

  return {
    selectedPrompts,
    enabledPrompts,
    setEnabledPrompts,
    toggleSelection,
    toggleEnabled,
    selectAll,
    clearSelection,
    isSelected,
    isEnabled,
  };
}
