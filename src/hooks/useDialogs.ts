import { useState, useCallback } from "react";
import type { GeneratedPrompt } from "../types";

type DialogName =
  | "generate"
  | "csv"
  | "settings"
  | "manual"
  | "edit"
  | "export";

export function useDialogs() {
  const [openDialogs, setOpenDialogs] = useState<Set<DialogName>>(new Set());
  const [editingPrompt, setEditingPrompt] = useState<GeneratedPrompt | null>(
    null,
  );

  const openDialog = useCallback((name: DialogName) => {
    setOpenDialogs((prev) => new Set(prev).add(name));
  }, []);

  const closeDialog = useCallback((name: DialogName) => {
    setOpenDialogs((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    if (name === "edit") {
      setEditingPrompt(null);
    }
  }, []);

  const openEditDialog = useCallback((prompt: GeneratedPrompt) => {
    setEditingPrompt(prompt);
    setOpenDialogs((prev) => new Set(prev).add("edit"));
  }, []);

  const isOpen = useCallback(
    (name: DialogName) => openDialogs.has(name),
    [openDialogs],
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    openEditDialog,
    editingPrompt,
  };
}
