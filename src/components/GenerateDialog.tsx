import * as React from "react";

import { FaSpinner, FaMagic, FaTimes, FaImage, FaVideo, FaSquare, FaHashtag } from "react-icons/fa";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { PromptConfig, DetectedSettings } from "../types";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { log } from "../utils/logger";

interface GenerateDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (count: number, context: string, onProgress?: (current: number, total: number) => void) => Promise<void>;
  detectedSettings?: DetectedSettings | null;
}

export function GenerateDialog({ config, isOpen, onClose, onGenerate, detectedSettings }: GenerateDialogProps) {
  const [count, setCount] = React.useState(config.batchSize || 10);
  const [context, setContext] = React.useState(config.contextPrompt || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setCount(config.batchSize || 10);
      setContext(config.contextPrompt || "");
      setError("");
      setProgress({ current: 0, total: 0 });
    }
  }, [isOpen, config.batchSize, config.contextPrompt]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!context.trim()) {
      setError("Please enter a context prompt");
      return;
    }

    if (!config.apiKey) {
      setError("Please configure your API key in Settings");
      return;
    }

    setLoading(true);
    setError("");
    setProgress({ current: 0, total: count });

    try {
      log.ui.action("GenerateDialog:Submit", { count, contextLength: context.length });
      await onGenerate(count, context, (current, total) => {
        setProgress({ current, total });
      });
      log.ui.action("GenerateDialog:Success");
      // Keep dialog open briefly to show completion, then close
      setTimeout(() => {
        onClose();
      }, 500);
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
            <FaMagic className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Generate Prompts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        {/* Detected Settings Info */}
        {detectedSettings && (detectedSettings.mediaType || detectedSettings.aspectRatio || detectedSettings.variations) && (
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground">Using settings from Sora page:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {detectedSettings.mediaType && (
                <Badge variant="outline" className="gap-1 text-xs">
                  {detectedSettings.mediaType === 'video' ? (
                    <FaVideo className="h-3 w-3" />
                  ) : (
                    <FaImage className="h-3 w-3" />
                  )}
                  {detectedSettings.mediaType.charAt(0).toUpperCase() + detectedSettings.mediaType.slice(1)}
                </Badge>
              )}
              {detectedSettings.aspectRatio && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <FaSquare className="h-3 w-3" />
                  {detectedSettings.aspectRatio}
                </Badge>
              )}
              {detectedSettings.variations && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <FaHashtag className="h-3 w-3" />
                  {detectedSettings.variations}v
                </Badge>
              )}
            </div>
          </div>
        )}

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

          {/* Progress Bar */}
          {loading && progress.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Generating prompts...
                </span>
                <span className="font-medium">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress.current} prompt{progress.current !== 1 ? "s" : ""} successfully generated
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ?
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              : <>
                  <FaMagic className="h-4 w-4 mr-2" />
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
