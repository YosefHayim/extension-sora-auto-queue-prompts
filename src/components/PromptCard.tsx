import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  FaCheckCircle,
  FaCheckSquare,
  FaChevronDown,
  FaChevronUp,
  FaClipboard,
  FaClock,
  FaCopy,
  FaDice,
  FaImage,
  FaLink,
  FaLocationArrow,
  FaMagic,
  FaPalette,
  FaPencilAlt,
  FaPlay,
  FaPowerOff,
  FaRedo,
  FaSquare,
  FaTimesCircle,
  FaTrash,
  FaUpload,
  FaVideo,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
  onAddImage?: (id: string, imageUrl: string) => void;
  onAddLocalImage?: (
    id: string,
    imageData: string,
    imageName: string,
    imageType: string,
  ) => void;
  onRemoveImage?: (id: string) => void;
  searchQuery?: string;
}

const MAX_TEXT_LENGTH = 200;

/**
 * Highlights matching text in a string based on search query
 */
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
      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false });
      }
      break;
    }

    // Add text before match
    if (index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, index), isMatch: false });
    }

    // Add matched text
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
  onAddImage,
  onAddLocalImage,
  onRemoveImage,
  searchQuery = "",
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(Date.now());
  const [showImageInput, setShowImageInput] = React.useState(false);
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update current time for processing prompts to refresh progress bar and time displays
  React.useEffect(() => {
    const isProcessing = prompt.status === "processing";
    if (!isProcessing) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second

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
    log.ui.action("PromptCard:Retry", {
      promptId: prompt.id,
    });
    onRetry?.(prompt.id);
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

    // Validate file size (max 10MB)
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

    // Validate file type
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

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64DataUrl = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64Content = base64DataUrl.split(",")[1];
      onAddLocalImage(prompt.id, base64Content, file.name, file.type);
    };
    reader.onerror = () => {
      log.ui.error("PromptCard:FileSelect", { error: "Failed to read file" });
      alert("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="h-3.5 w-3.5" />;
      case "processing":
        return <FaClock className="h-3.5 w-3.5" />;
      case "pending":
        return <FaClock className="h-3.5 w-3.5" />;
      case "failed":
        return <FaTimesCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-l-green-500 dark:border-l-green-400";
      case "processing":
        return "border-l-yellow-500 dark:border-l-yellow-400";
      case "pending":
        return "border-l-gray-400 dark:border-l-gray-500";
      case "failed":
        return "border-l-red-500 dark:border-l-red-400";
      default:
        return "border-l-gray-400";
    }
  };

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(prompt.id);
  };

  const handleToggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleEnabled?.(prompt.id);
  };

  const handleProcess = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProcess?.(prompt.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not on interactive elements
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

    // Allow clicks on mark elements (highlighted search text) to work
    // If clicking on mark, use the parent element to check
    const clickTarget =
      target.tagName === "MARK" ? target.parentElement : target;

    // Only navigate for completed prompts
    if (prompt.status === "completed" && onNavigateToPrompt) {
      onNavigateToPrompt(prompt.id, prompt.text);
    }
  };

  const isCompleted = prompt.status === "completed";
  const isProcessing = prompt.status === "processing";
  const canEdit = !isCompleted && !isProcessing;
  const canRefine = !isCompleted && !isProcessing;

  // Estimate completion time for processing prompts (average 2-3 minutes)
  const estimatedCompletion =
    isProcessing && prompt.startTime
      ? prompt.startTime + 2.5 * 60 * 1000 // 2.5 minutes average
      : null;
  const estimatedTimeRemaining = estimatedCompletion
    ? Math.max(0, estimatedCompletion - currentTime)
    : null;

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group transition-all duration-200 hover:shadow-md hover:border-primary/30 relative overflow-hidden",
        "border-l-4",
        getStatusBorderColor(prompt.status),
        isProcessing && "ring-1 ring-yellow-500/20 dark:ring-yellow-400/20",
        isSelected &&
          "border-2 border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/20 dark:ring-blue-400/20 bg-blue-50/50 dark:bg-blue-950/30",
        prompt.status === "failed" && "bg-destructive/5 dark:bg-destructive/10",
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onToggleEnabled && (
            <button
              onClick={handleToggleEnabled}
              className="flex-shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
              title={isEnabled ? "Disable prompt" : "Enable prompt"}
              data-no-drag
            >
              <FaPowerOff
                className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  isEnabled
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground opacity-50",
                )}
              />
            </button>
          )}
          {onToggleSelection && (
            <button
              onClick={handleToggleSelection}
              className="flex-shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
              title={isSelected ? "Deselect" : "Select"}
              data-no-drag
            >
              {isSelected ? (
                <FaCheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FaSquare className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              className={cn(
                "text-xs font-medium",
                prompt.mediaType === "video" &&
                  "text-blue-600 dark:text-blue-400",
                prompt.mediaType === "image" &&
                  "text-purple-600 dark:text-purple-400",
              )}
            >
              {prompt.mediaType === "video" ? (
                <FaVideo className="h-3 w-3 inline mr-1" />
              ) : (
                <FaImage className="h-3 w-3 inline mr-1" />
              )}
            </span>
            {prompt.aspectRatio && (
              <span className="text-xs text-muted-foreground">
                • {prompt.aspectRatio}
              </span>
            )}
            {prompt.variations && (
              <span className="text-xs text-muted-foreground">
                • {prompt.variations}v
              </span>
            )}
            {prompt.enhanced && (
              <span className="text-xs text-purple-600 dark:text-purple-400">
                <FaMagic className="h-3 w-3 inline mr-0.5" />
              </span>
            )}
            {prompt.preset && prompt.preset !== "none" && (
              <span
                className={cn(
                  "text-xs flex items-center gap-0.5",
                  prompt.preset === "random"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-orange-600 dark:text-orange-400",
                )}
                title={`Preset: ${prompt.preset === "random" ? "Random" : prompt.preset}`}
              >
                •
                {prompt.preset === "random" ? (
                  <FaDice className="h-3 w-3" />
                ) : (
                  <FaPalette className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onProcess && prompt.status === "pending" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleProcess}
              className="h-6 px-2 text-xs gap-1"
              title="Process"
              data-no-drag
            >
              <FaPlay className="h-3 w-3" />
            </Button>
          )}
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 text-xs font-medium border-0",
              isProcessing && "text-yellow-600 dark:text-yellow-400",
              isCompleted && "text-green-600 dark:text-green-400",
              prompt.status === "pending" && "text-muted-foreground",
              prompt.status === "failed" && "text-red-600 dark:text-red-400",
            )}
          >
            {getStatusIcon(prompt.status)}
            <span className="capitalize text-[10px]">{prompt.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2">
        <div className="space-y-1.5">
          <p className="text-sm leading-relaxed text-foreground">
            {highlightText(displayText, searchQuery)}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <FaChevronUp className="h-2.5 w-2.5" />
                  Show less
                </>
              ) : (
                <>
                  <FaChevronDown className="h-2.5 w-2.5" />
                  Read more
                </>
              )}
            </button>
          )}

          {/* Progress indicator for processing prompts */}
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
              {prompt.progress === undefined &&
                estimatedTimeRemaining !== null &&
                estimatedTimeRemaining > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ~{formatDuration(estimatedTimeRemaining)} remaining
                  </span>
                )}
            </div>
          )}

          {/* Compact timing info */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {prompt.timestamp && <span>{formatTimeAgo(prompt.timestamp)}</span>}
            {isCompleted && prompt.duration && (
              <span>• {formatDuration(prompt.duration)}</span>
            )}
            {isProcessing && prompt.startTime && (
              <span className="flex items-center gap-1">
                <FaClock className="h-2.5 w-2.5 animate-pulse" />
                {formatDuration(currentTime - prompt.startTime)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter
        className="flex-col gap-2 pt-1.5 border-t px-3 pb-2 relative"
        data-no-drag
      >
        {/* Hidden file input for local image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          data-no-drag
        />

        {/* Image attachment section - supports both URL and local files */}
        {(prompt.imageUrl || prompt.imageData) && (
          <div className="w-full flex items-center gap-2 p-2 bg-muted/50 rounded-md">
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
              {prompt.imageData && !prompt.imageUrl && (
                <p className="text-[9px] text-muted-foreground/70">
                  Local file
                </p>
              )}
            </div>
            {onRemoveImage && canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                title="Remove image"
                type="button"
                data-no-drag
                className="h-6 w-6 text-destructive hover:text-destructive"
              >
                <FaTimesCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Image URL input */}
        {showImageInput && (
          <div className="w-full flex items-center gap-2">
            <input
              type="url"
              placeholder="Enter image URL..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 h-7 px-2 text-xs border rounded bg-background"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  handleAddImage();
                } else if (e.key === "Escape") {
                  setShowImageInput(false);
                  setImageUrlInput("");
                }
              }}
              data-no-drag
            />
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddImage();
              }}
              disabled={!imageUrlInput.trim()}
              className="h-7 px-2 text-xs"
              data-no-drag
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageInput(false);
                setImageUrlInput("");
              }}
              className="h-7 px-2 text-xs"
              data-no-drag
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="w-full flex items-center gap-0.5">
          {isCompleted && onNavigateToPrompt && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToPrompt(prompt.id, prompt.text);
              }}
              title="Navigate to generated media"
              type="button"
              data-no-drag
              className="h-6 w-6"
            >
              <FaLocationArrow className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyText}
            title="Copy"
            type="button"
            data-no-drag
            className="h-6 w-6"
          >
            {copied ? (
              <FaCheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <FaClipboard className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            disabled={!canEdit}
            title="Edit"
            type="button"
            data-no-drag
            className="h-6 w-6"
          >
            <FaPencilAlt className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDuplicate}
            title="Duplicate"
            type="button"
            data-no-drag
            className="h-6 w-6"
          >
            <FaCopy className="h-3.5 w-3.5" />
          </Button>
          {canRefine && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefine}
              title="Duplicate with AI refinement"
              type="button"
              data-no-drag
              className="h-6 w-6"
            >
              <FaWandMagicSparkles className="h-3.5 w-3.5 text-purple-500" />
            </Button>
          )}
          {prompt.status === "failed" && onRetry && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRetry}
              title="Retry failed prompt"
              type="button"
              data-no-drag
              className="h-6 w-6 text-orange-500 hover:text-orange-600"
            >
              <FaRedo className="h-3.5 w-3.5" />
            </Button>
          )}
          {!prompt.imageUrl && !prompt.imageData && canEdit && (
            <>
              {onAddImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageInput(true);
                  }}
                  title="Add image URL"
                  type="button"
                  data-no-drag
                  className="h-6 w-6"
                >
                  <FaLink className="h-3.5 w-3.5" />
                </Button>
              )}
              {onAddLocalImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  title="Upload local image"
                  type="button"
                  data-no-drag
                  className="h-6 w-6"
                >
                  <FaUpload className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Delete"
            type="button"
            data-no-drag
            className="h-6 w-6 text-destructive hover:text-destructive"
          >
            <FaTrash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
