import * as React from "react";

import type { GeneratedPrompt, PromptConfig } from "../types";
import { FaPlus, FaSpinner, FaTimes } from "react-icons/fa";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { log } from "../utils/logger";

interface ManualAddDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (prompts: GeneratedPrompt[]) => Promise<void>;
}

export function ManualAddDialog({
  config,
  isOpen,
  onClose,
  onAdd,
}: ManualAddDialogProps) {
  const [input, setInput] = React.useState("");
  const [delimiter, setDelimiter] = React.useState<"line" | "comma">("line");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  if (!isOpen) return null;

  function parsePrompts(): string[] {
    if (!input.trim()) return [];

    const rawPrompts =
      delimiter === "line" ? input.split("\n") : input.split(",");

    // Filter empty lines and trim whitespace
    return rawPrompts.map((p) => p.trim()).filter((p) => p.length > 0);
  }

  const promptCount = parsePrompts().length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const prompts = parsePrompts();

    if (prompts.length === 0) {
      setError("Please enter at least one prompt");
      return;
    }

    setLoading(true);
    setError("");

    try {
      log.ui.action("ManualAddDialog:Submit", {
        count: prompts.length,
        delimiter,
      });

      const { generateUniqueId } = await import("../lib/utils");
      const newPrompts: GeneratedPrompt[] = prompts.map((text) => ({
        id: generateUniqueId(),
        text,
        timestamp: Date.now(),
        status: "pending" as const,
        mediaType: config.mediaType || "video",
        variations: config.variationCount || 2,
      }));

      await onAdd(newPrompts);
      log.ui.action("ManualAddDialog:Success", { count: newPrompts.length });

      // Reset form and close
      setInput("");
      onClose();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add prompts";
      setError(errorMsg);
      log.ui.error("ManualAddDialog:Submit", err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-full max-w-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Add Prompts Manually</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Delimiter</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delimiter"
                  value="line"
                  checked={delimiter === "line"}
                  onChange={() => setDelimiter("line")}
                  disabled={loading}
                  className="h-4 w-4"
                />
                <span className="text-sm">Line separated (one per line)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delimiter"
                  value="comma"
                  checked={delimiter === "comma"}
                  onChange={() => setDelimiter("comma")}
                  disabled={loading}
                  className="h-4 w-4"
                />
                <span className="text-sm">Comma separated</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompts">Prompts</Label>
            <Textarea
              id="prompts"
              placeholder={
                delimiter === "line"
                  ? "A cinematic shot of a sunset\nA dramatic landscape with mountains\nA futuristic cityscape at night"
                  : "A cinematic shot of a sunset, A dramatic landscape with mountains, A futuristic cityscape at night"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              rows={12}
              className="resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {promptCount === 0
                ? `Enter prompts separated by ${delimiter === "line" ? "new lines" : "commas"}`
                : `${promptCount} prompt${promptCount === 1 ? "" : "s"} will be added`}
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || promptCount === 0}
            >
              {loading ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FaPlus className="h-4 w-4 mr-2" />
                  Add {promptCount > 0 ? `${promptCount} ` : ""}Prompt
                  {promptCount === 1 ? "" : "s"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
