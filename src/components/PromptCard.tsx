import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  FaCheckCircle,
  FaCheckSquare,
  FaChevronDown,
  FaChevronUp,
  FaClipboard,
  FaClock,
  FaCopy,
  FaEllipsisV,
  FaFileAlt,
  FaImage,
  FaLocationArrow,
  FaMagic,
  FaPencilAlt,
  FaPlay,
  FaSquare,
  FaTimesCircle,
  FaTrash,
  FaVideo,
} from "react-icons/fa";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { GeneratedPrompt } from "../types";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";
import { log } from "../utils/logger";

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return `${ms || 0}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  return "Just now";
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PromptCardProps {
  prompt: GeneratedPrompt;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onProcess?: (id: string) => void;
  onNavigateToPrompt?: (id: string, text: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
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
    parts.push({ text: text.substring(index, index + query.length), isMatch: true });
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
            )
          )}
        </>
      );
}

export function PromptCard({
  prompt,
  isSelected = false,
  onToggleSelection,
  onProcess,
  onNavigateToPrompt,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onDelete,
  searchQuery = "",
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const shouldTruncate = prompt.text.length > MAX_TEXT_LENGTH;
  const displayText = isExpanded || !shouldTruncate ? prompt.text : prompt.text.substring(0, MAX_TEXT_LENGTH) + "...";

  const handleEdit = () => {
    log.ui.action("PromptCard:Edit", { promptId: prompt.id, status: prompt.status });
    onEdit(prompt.id);
  };

  const handleDuplicate = () => {
    log.ui.action("PromptCard:Duplicate", { promptId: prompt.id, mediaType: prompt.mediaType });
    onDuplicate(prompt.id);
  };

  const handleRefine = () => {
    log.ui.action("PromptCard:Refine", { promptId: prompt.id, enhanced: prompt.enhanced });
    onRefine(prompt.id);
  };

  const handleGenerateSimilar = () => {
    log.ui.action("PromptCard:GenerateSimilar", { promptId: prompt.id });
    onGenerateSimilar(prompt.id);
  };

  const handleDelete = () => {
    log.ui.action("PromptCard:Delete", { promptId: prompt.id, status: prompt.status });
    onDelete(prompt.id);
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
    const clickTarget = target.tagName === "MARK" ? target.parentElement : target;

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
    isProcessing && prompt.startTime ?
      prompt.startTime + 2.5 * 60 * 1000 // 2.5 minutes average
    : null;
  const estimatedTimeRemaining = estimatedCompletion ? Math.max(0, estimatedCompletion - Date.now()) : null;

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "group transition-all duration-200 hover:shadow-md hover:border-primary/30 relative overflow-hidden",
        "border-l-4",
        getStatusBorderColor(prompt.status),
        isProcessing && "ring-1 ring-yellow-500/20 dark:ring-yellow-400/20",
        isSelected && "border-2 border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/20 dark:ring-blue-400/20 bg-blue-50/50 dark:bg-blue-950/30",
        prompt.status === "failed" && "bg-destructive/5 dark:bg-destructive/10",
        isCompleted && onNavigateToPrompt && "cursor-pointer hover:ring-1 hover:ring-green-500/30"
      )}
      title={isCompleted && onNavigateToPrompt ? "Click to navigate to this prompt on Sora" : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onToggleSelection && (
            <button
              onClick={handleToggleSelection}
              className="flex-shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
              title={isSelected ? "Deselect" : "Select"}
              data-no-drag
            >
              {isSelected ?
                <FaCheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              : <FaSquare className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className={cn(
              "text-xs font-medium",
              prompt.mediaType === "video" && "text-blue-600 dark:text-blue-400",
              prompt.mediaType === "image" && "text-purple-600 dark:text-purple-400"
            )}>
              {prompt.mediaType === "video" ? <FaVideo className="h-3 w-3 inline mr-1" /> : <FaImage className="h-3 w-3 inline mr-1" />}
            </span>
            {prompt.aspectRatio && (
              <span className="text-xs text-muted-foreground">• {prompt.aspectRatio}</span>
            )}
            {prompt.variations && (
              <span className="text-xs text-muted-foreground">• {prompt.variations}v</span>
            )}
            {prompt.enhanced && (
              <span className="text-xs text-purple-600 dark:text-purple-400">
                <FaMagic className="h-3 w-3 inline mr-0.5" />
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onProcess && prompt.status === "pending" && (
            <Button variant="default" size="sm" onClick={handleProcess} className="h-6 px-2 text-xs gap-1" title="Process" data-no-drag>
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
              prompt.status === "failed" && "text-red-600 dark:text-red-400"
            )}
          >
            {getStatusIcon(prompt.status)}
            <span className="capitalize text-[10px]">{prompt.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2">
        <div className="space-y-1.5">
          <p className="text-sm leading-relaxed text-foreground">{highlightText(displayText, searchQuery)}</p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {isExpanded ?
                <>
                  <FaChevronUp className="h-2.5 w-2.5" />
                  Show less
                </>
              : <>
                  <FaChevronDown className="h-2.5 w-2.5" />
                  Read more
                </>
              }
            </button>
          )}

          {/* Progress indicator for processing prompts */}
          {isProcessing && (
            <div className="space-y-1">
              <Progress value={prompt.startTime ? Math.min(90, ((Date.now() - prompt.startTime) / (2.5 * 60 * 1000)) * 100) : 0} className="h-1" />
              {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                <span className="text-[10px] text-muted-foreground">~{formatDuration(estimatedTimeRemaining)} remaining</span>
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
                {formatDuration(Date.now() - prompt.startTime)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-0 pt-1.5 border-t px-3 pb-2" data-no-drag>
        <div className="flex items-center gap-0.5 flex-1">
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
          <Button variant="ghost" size="icon" onClick={handleCopyText} title="Copy" type="button" data-no-drag className="h-6 w-6">
            {copied ?
              <FaCheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            : <FaClipboard className="h-3.5 w-3.5" />}
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
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              data-no-drag
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FaEllipsisV className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={handleDuplicate}>
              <FaCopy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleRefine} disabled={!canRefine}>
              <FaMagic className="h-4 w-4 mr-2" />
              Refine with AI
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleGenerateSimilar}>
              <FaMagic className="h-4 w-4 mr-2" />
              Generate Similar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive">
              <FaTrash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
