import * as React from "react";

import {
  LuCheck,
  LuChevronDown,
  LuChevronUp,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCopy,
  LuGripVertical,
  LuImage,
  LuLoader,
  LuPaperclip,
  LuPencil,
  LuSkipForward,
  LuSparkles,
  LuTrash2,
  LuVideo,
  LuClipboard,
  LuX,
} from "react-icons/lu";

import { Badge } from "./ui/badge";
import { PromptActionsMenu } from "./PromptActionsMenu";
import type { GeneratedPrompt } from "../types";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";
import { formatDuration, formatTimeAgo } from "../utils/formatters";
import { log } from "../utils/logger";

interface PromptCardProps {
  prompt: GeneratedPrompt;
  isSelected?: boolean;
  isEnabled?: boolean;
  onToggleSelection?: (id: string) => void;
  onToggleEnabled?: (id: string) => void;
  onProcess?: (id: string) => void;
  onNavigateToPrompt?: (id: string, text: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  onSkip?: (id: string) => void;
  onAddImage?: (id: string, imageUrl: string) => void;
  onAddLocalImage?: (
    id: string,
    imageData: string,
    imageName: string,
    imageType: string,
  ) => void;
  onRemoveImage?: (id: string) => void;
  searchQuery?: string;
  showDragHandle?: boolean;
}

const MAX_TEXT_LENGTH = 200;

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim()) {
    return text;
  }

  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  const parts: Array<{ text: string; isMatch: boolean }> = [];
  let lastIndex = 0;
  let searchIndex = 0;

  while (true) {
    const index = textLower.indexOf(queryLower, searchIndex);
    if (index === -1) {
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false });
      }
      break;
    }

    if (index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, index), isMatch: false });
    }

    parts.push({
      text: text.substring(index, index + query.length),
      isMatch: true,
    });
    lastIndex = index + query.length;
    searchIndex = index + 1;
  }

  return (
    <>
      {parts.map((part, i) =>
        part.isMatch ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 px-0.5 rounded pointer-events-none"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function PromptCard({
  prompt,
  isSelected = false,
  isEnabled = true,
  onToggleSelection,
  onToggleEnabled,
  onProcess,
  onNavigateToPrompt,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onDelete,
  onRetry,
  onSkip,
  onAddImage,
  onAddLocalImage,
  onRemoveImage,
  searchQuery = "",
  showDragHandle = true,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  const [showImageInput, setShowImageInput] = React.useState(false);
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const isProcessing = prompt.status === "processing";
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [prompt.status]);

  const shouldTruncate = prompt.text.length > MAX_TEXT_LENGTH;
  const displayText =
    isExpanded || !shouldTruncate
      ? prompt.text
      : prompt.text.substring(0, MAX_TEXT_LENGTH) + "...";

  const handleEdit = () => {
    log.ui.action("PromptCard:Edit", {
      promptId: prompt.id,
      status: prompt.status,
    });
    onEdit(prompt.id);
  };

  const handleDuplicate = () => {
    log.ui.action("PromptCard:Duplicate", {
      promptId: prompt.id,
      mediaType: prompt.mediaType,
    });
    onDuplicate(prompt.id);
  };

  const handleRefine = () => {
    log.ui.action("PromptCard:Refine", {
      promptId: prompt.id,
      enhanced: prompt.enhanced,
    });
    onRefine(prompt.id);
  };

  const handleGenerateSimilar = () => {
    log.ui.action("PromptCard:GenerateSimilar", { promptId: prompt.id });
    onGenerateSimilar(prompt.id);
  };

  const handleDelete = () => {
    log.ui.action("PromptCard:Delete", {
      promptId: prompt.id,
      status: prompt.status,
    });
    onDelete(prompt.id);
  };

  const handleRetry = () => {
    log.ui.action("PromptCard:Retry", { promptId: prompt.id });
    onRetry?.(prompt.id);
  };

  const handleSkip = () => {
    log.ui.action("PromptCard:Skip", { promptId: prompt.id });
    onSkip?.(prompt.id);
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim() && onAddImage) {
      log.ui.action("PromptCard:AddImage", {
        promptId: prompt.id,
        imageUrl: imageUrlInput.substring(0, 50),
      });
      onAddImage(prompt.id, imageUrlInput.trim());
      setImageUrlInput("");
      setShowImageInput(false);
    }
  };

  const handleRemoveImage = () => {
    if (onRemoveImage) {
      log.ui.action("PromptCard:RemoveImage", { promptId: prompt.id });
      onRemoveImage(prompt.id);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddLocalImage) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      log.ui.error("PromptCard:FileSelect", {
        error: "File too large",
        size: file.size,
        maxSize: MAX_FILE_SIZE,
      });
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      log.ui.error("PromptCard:FileSelect", {
        error: "Invalid file type",
        type: file.type,
      });
      alert(
        "Invalid file type. Please select a PNG, JPEG, GIF, or WebP image.",
      );
      return;
    }

    log.ui.action("PromptCard:FileSelect", {
      promptId: prompt.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64DataUrl = reader.result as string;
      const base64Content = base64DataUrl.split(",")[1];
      onAddLocalImage(prompt.id, base64Content, file.name, file.type);
    };
    reader.onerror = () => {
      log.ui.error("PromptCard:FileSelect", { error: "Failed to read file" });
      alert("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      log.ui.action("PromptCard:CopyText", { promptId: prompt.id });
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(prompt.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[data-no-drag]") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[role='menu']") ||
      target.closest("[role='menuitem']") ||
      target.closest("[data-radix-dropdown-menu-content]")
    ) {
      return;
    }

    if (prompt.status === "completed" && onNavigateToPrompt) {
      onNavigateToPrompt(prompt.id, prompt.text);
    }
  };

  const isCompleted = prompt.status === "completed";
  const isProcessing = prompt.status === "processing";
  const isPending = prompt.status === "pending";
  const isFailed = prompt.status === "failed";
  const canEdit = !isCompleted && !isProcessing;
  const canRefine = !isCompleted && !isProcessing;

  const getStatusBadge = () => {
    switch (prompt.status) {
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500 text-white border-0 px-2 py-0.5 rounded-full text-[11px] font-medium">
            <LuCheck className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="gap-1 bg-blue-500 text-white border-0 px-2 py-0.5 rounded-full text-[11px] font-medium">
            <LuLoader className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge className="gap-1 bg-muted text-muted-foreground border-0 px-2 py-0.5 rounded-full text-[11px] font-medium">
            <LuClock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="gap-1 bg-destructive text-destructive-foreground border-0 px-2 py-0.5 rounded-full text-[11px] font-medium">
            <LuX className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = () => {
    if (prompt.mediaType === "video") {
      return (
        <Badge
          variant="outline"
          className="gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground"
        >
          <LuVideo className="h-3 w-3" />
          Video
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground"
      >
        <LuImage className="h-3 w-3" />
        Image
      </Badge>
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "w-[280px] bg-card rounded-lg border border-border transition-all duration-200 hover:shadow-md hover:border-primary/30",
        isSelected &&
          "border-2 border-blue-500 ring-1 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30",
        isFailed && "bg-destructive/5 dark:bg-destructive/10",
        isCompleted &&
          onNavigateToPrompt &&
          "cursor-pointer hover:ring-1 hover:ring-green-500/30",
      )}
      title={
        isCompleted && onNavigateToPrompt
          ? "Click to navigate to this prompt on Sora"
          : undefined
      }
    >
      <div className="flex gap-2 p-3">
        <div className="flex flex-col items-center gap-2 pt-1">
          {showDragHandle && (
            <LuGripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
          )}

          {onToggleSelection && (
            <button
              onClick={handleToggleSelection}
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border-[1.5px] transition-colors",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-border hover:border-primary/50",
              )}
              title={isSelected ? "Deselect" : "Select"}
              data-no-drag
            >
              {isSelected && (
                <LuCheck className="h-2.5 w-2.5 text-primary-foreground" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2.5 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {getStatusBadge()}
              {getTypeBadge()}
            </div>

            <PromptActionsMenu
              promptId={prompt.id}
              status={prompt.status}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onRefine={handleRefine}
              onGenerateSimilar={handleGenerateSimilar}
              onSkip={isPending && onSkip ? handleSkip : undefined}
              onAttachImage={
                canEdit && onAddImage
                  ? () => setShowImageInput(true)
                  : undefined
              }
              onRetry={isFailed && onRetry ? handleRetry : undefined}
              onDelete={handleDelete}
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[13px] leading-[1.4] text-card-foreground">
              {highlightText(displayText, searchQuery)}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
              >
                {isExpanded ? (
                  <>
                    <LuChevronUp className="h-2.5 w-2.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <LuChevronDown className="h-2.5 w-2.5" />
                    Read more
                  </>
                )}
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-1">
              <Progress
                value={
                  prompt.progress !== undefined
                    ? prompt.progress
                    : prompt.startTime
                      ? Math.min(
                          90,
                          ((currentTime - prompt.startTime) /
                            (2.5 * 60 * 1000)) *
                            100,
                        )
                      : 0
                }
                className="h-1"
              />
              {prompt.progress !== undefined && prompt.progress < 100 && (
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(prompt.progress)}%
                </span>
              )}
            </div>
          )}

          {(prompt.imageUrl || prompt.imageData) && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <img
                src={
                  prompt.imageUrl ||
                  `data:${prompt.imageType || "image/png"};base64,${prompt.imageData}`
                }
                alt="Reference"
                className="h-10 w-10 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">
                  {prompt.imageUrl || prompt.imageName || "Local image"}
                </p>
              </div>
              {onRemoveImage && canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="p-1 text-destructive hover:text-destructive/80"
                  title="Remove image"
                  data-no-drag
                >
                  <LuCircleX className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {showImageInput && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Enter image URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 h-7 px-2 text-xs border rounded bg-background"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleAddImage();
                  else if (e.key === "Escape") {
                    setShowImageInput(false);
                    setImageUrlInput("");
                  }
                }}
                data-no-drag
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddImage();
                }}
                disabled={!imageUrlInput.trim()}
                className="h-7 px-2 text-xs bg-primary text-primary-foreground rounded disabled:opacity-50"
                data-no-drag
              >
                Add
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageInput(false);
                  setImageUrlInput("");
                }}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                data-no-drag
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1" data-no-drag>
            <span className="text-[11px] text-muted-foreground">
              {prompt.timestamp && formatTimeAgo(prompt.timestamp)}
              {isCompleted &&
                prompt.duration &&
                ` • ${formatDuration(prompt.duration)}`}
              {isProcessing && prompt.startTime && (
                <span className="inline-flex items-center gap-0.5">
                  <LuClock className="h-2.5 w-2.5 animate-pulse" />
                  {formatDuration(currentTime - prompt.startTime)}
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit"
                  data-no-drag
                >
                  <LuPencil className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyText();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy to clipboard"
                data-no-drag
              >
                {copied ? (
                  <LuCircleCheck className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <LuClipboard className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Duplicate"
                data-no-drag
              >
                <LuCopy className="h-3.5 w-3.5" />
              </button>

              {canRefine && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefine();
                  }}
                  className="text-purple-500 hover:text-purple-600 transition-colors"
                  title="Refine with AI"
                  data-no-drag
                >
                  <LuSparkles className="h-3.5 w-3.5" />
                </button>
              )}

              {isPending && onSkip && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Skip"
                  data-no-drag
                >
                  <LuSkipForward className="h-3.5 w-3.5" />
                </button>
              )}

              {canEdit &&
                !prompt.imageUrl &&
                !prompt.imageData &&
                (onAddImage || onAddLocalImage) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddLocalImage) {
                        fileInputRef.current?.click();
                      } else {
                        setShowImageInput(true);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Attach image"
                    data-no-drag
                  >
                    <LuPaperclip className="h-3.5 w-3.5" />
                  </button>
                )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
                data-no-drag
              >
                <LuTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        data-no-drag
      />
    </div>
  );
}
