import * as React from "react";

import { FaEdit, FaSpinner, FaTimes } from "react-icons/fa";

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
  onSave: (
    id: string,
    newText: string,
    mediaType?: "video" | "image",
  ) => Promise<void>;
}

export function EditPromptDialog({
  prompt,
  isOpen,
  onClose,
  onSave,
}: EditPromptDialogProps) {
  const [editedText, setEditedText] = React.useState("");
  const [mediaType, setMediaType] = React.useState<"video" | "image">(
    prompt?.mediaType || "video",
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Initialize editedText and mediaType when prompt changes
  React.useEffect(() => {
    if (prompt) {
      setEditedText(prompt.text);
      setMediaType(prompt.mediaType || "video");
      setError("");
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const hasChanges =
    editedText.trim() !== prompt.text.trim() || mediaType !== prompt.mediaType;
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

      await onSave(prompt?.id || "", trimmedText, mediaType);
      log.ui.action("EditPromptDialog:Success", {
        promptId: prompt?.id,
        mediaType,
      });

      onClose();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to edit prompt";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-[400px] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaEdit className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Edit Prompt</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={loading}
          >
            <FaTimes className="h-4 w-4" />
          </Button>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={loading}
              className="resize-none text-[13px] h-40 p-3"
              autoFocus
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {editedText.length} character
                {editedText.length === 1 ? "" : "s"}
              </span>
              {hasChanges && (
                <span className="text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          {/* Media Type Section */}
          <div className="space-y-2">
            <Label className="text-sm">Media Type</Label>
            <div className="flex items-center gap-4">
              <label
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setMediaType("video")}
              >
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary">
                  {mediaType === "video" && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[13px]">Video</span>
              </label>

              <label
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setMediaType("image")}
              >
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-muted-foreground">
                  {mediaType === "image" && (
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  )}
                </div>
                <span className="text-[13px] text-muted-foreground">Image</span>
              </label>
            </div>
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
              disabled={loading || !isValid || !hasChanges}
            >
              {loading ? (
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaEdit className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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
