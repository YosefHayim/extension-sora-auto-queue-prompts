import * as React from "react";

import { Edit3, Loader2, X } from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { GeneratedPrompt } from "../types";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { log } from "../utils/logger";

interface EditPromptDialogProps {
  prompt: GeneratedPrompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newText: string) => Promise<void>;
}

export function EditPromptDialog({ prompt, isOpen, onClose, onSave }: EditPromptDialogProps) {
  const [editedText, setEditedText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Initialize editedText when prompt changes
  React.useEffect(() => {
    if (prompt) {
      setEditedText(prompt.text);
      setError("");
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const hasChanges = editedText.trim() !== prompt.text.trim();
  const isValid = editedText.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedText = editedText.trim();

    if (!trimmedText) {
      setError("Prompt text cannot be empty");
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    setError("");

    try {
      log.ui.action("EditPromptDialog:Submit", {
        promptId: prompt?.id,
        originalLength: prompt?.text.length,
        newLength: trimmedText.length,
      });

      await onSave(prompt?.id || "", trimmedText);
      log.ui.action("EditPromptDialog:Success", { promptId: prompt?.id });

      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to edit prompt";
      setError(errorMsg);
      log.ui.error("EditPromptDialog:Submit", err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;
    setEditedText(prompt?.text || ""); // Reset to original
    setError("");
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      handleCancel();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <Card className="w-full max-w-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Edit Prompt</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Prompt Info */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Type:</span> {prompt.mediaType}
          </div>
          <div>
            <span className="font-medium">Status:</span> {prompt.status}
          </div>
          {prompt.aspectRatio && (
            <div>
              <span className="font-medium">Aspect Ratio:</span> {prompt.aspectRatio}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-text">Prompt Text</Label>
            <Textarea
              id="prompt-text"
              placeholder="Enter prompt text..."
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={loading}
              rows={8}
              className="resize-none font-mono text-sm"
              autoFocus
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {editedText.length} character{editedText.length === 1 ? "" : "s"}
              </span>
              {hasChanges && <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>}
            </div>
          </div>

          {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading || !isValid || !hasChanges}>
              {loading ?
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              : <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              }
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
