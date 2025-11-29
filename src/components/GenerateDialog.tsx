import * as React from "react";

import { Loader2, Sparkles, X } from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { PromptConfig } from "../types";
import { Textarea } from "./ui/textarea";
import { log } from "../utils/logger";

interface GenerateDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (count: number, context: string) => Promise<void>;
}

export function GenerateDialog({ config, isOpen, onClose, onGenerate }: GenerateDialogProps) {
  const [count, setCount] = React.useState(config.batchSize || 10);
  const [context, setContext] = React.useState(config.contextPrompt || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!context.trim()) {
      setError("Please enter a context prompt");
      return;
    }

    if (!config.apiKey) {
      setError("Please configure your OpenAI API key in Settings");
      return;
    }

    setLoading(true);
    setError("");

    try {
      log.ui.action("GenerateDialog:Submit", { count, contextLength: context.length });
      await onGenerate(count, context);
      log.ui.action("GenerateDialog:Success");
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate prompts";
      setError(errorMsg);
      log.ui.error("GenerateDialog:Submit", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <Card className="w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Generate Prompts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of Prompts</Label>
            <Input id="count" type="number" min="1" max="100" value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} disabled={loading} />
            <p className="text-xs text-muted-foreground">Generate 1-100 prompts at once</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context Prompt</Label>
            <Textarea
              id="context"
              placeholder="e.g., Create cinematic shots of nature landscapes with dramatic lighting"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={loading}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Describe the theme or style for generated prompts</p>
          </div>

          {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ?
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              : <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              }
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
