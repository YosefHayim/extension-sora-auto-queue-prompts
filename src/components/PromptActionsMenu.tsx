import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LuPencil,
  LuCopy,
  LuSparkles,
  LuLayers,
  LuSkipForward,
  LuPaperclip,
  LuRefreshCw,
  LuWand,
  LuTrash2,
  LuEllipsis,
} from "react-icons/lu";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface PromptActionsMenuProps {
  promptId: string;
  status: "pending" | "processing" | "completed" | "failed" | "editing";
  onEdit: () => void;
  onDuplicate: () => void;
  onRefine: () => void;
  onGenerateSimilar: () => void;
  onSkip?: () => void;
  onAttachImage?: () => void;
  onRetry?: () => void;
  onOptimize?: () => void;
  onDelete: () => void;
  className?: string;
}

export function PromptActionsMenu({
  promptId,
  status,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onSkip,
  onAttachImage,
  onRetry,
  onOptimize,
  onDelete,
  className,
}: PromptActionsMenuProps) {
  const canEdit = status !== "completed" && status !== "processing";
  const canRefine = status !== "completed" && status !== "processing";
  const showRetry = status === "failed";
  const showSkip = status === "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6", className)}
          data-no-drag
        >
          <LuEllipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem
          onClick={onEdit}
          disabled={!canEdit}
          className="gap-2.5"
        >
          <LuPencil className="h-3.5 w-3.5" />
          <span className="text-[13px]">Edit prompt</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDuplicate} className="gap-2.5">
          <LuCopy className="h-3.5 w-3.5" />
          <span className="text-[13px]">Duplicate</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onRefine}
          disabled={!canRefine}
          className="gap-2.5"
        >
          <LuSparkles className="h-3.5 w-3.5" />
          <span className="text-[13px]">Refine with AI</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onGenerateSimilar} className="gap-2.5">
          <LuLayers className="h-3.5 w-3.5" />
          <span className="text-[13px]">Generate similar</span>
        </DropdownMenuItem>

        {showSkip && onSkip && (
          <DropdownMenuItem onClick={onSkip} className="gap-2.5">
            <LuSkipForward className="h-3.5 w-3.5" />
            <span className="text-[13px]">Skip</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onAttachImage && canEdit && (
          <DropdownMenuItem onClick={onAttachImage} className="gap-2.5">
            <LuPaperclip className="h-3.5 w-3.5" />
            <span className="text-[13px]">Attach image</span>
          </DropdownMenuItem>
        )}

        {showRetry && onRetry && (
          <DropdownMenuItem onClick={onRetry} className="gap-2.5">
            <LuRefreshCw className="h-3.5 w-3.5" />
            <span className="text-[13px]">Retry</span>
          </DropdownMenuItem>
        )}

        {onOptimize && canEdit && (
          <DropdownMenuItem onClick={onOptimize} className="gap-2.5">
            <LuWand className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-[13px] text-purple-500">
              Optimize with AI
            </span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2.5 text-destructive focus:text-destructive"
        >
          <LuTrash2 className="h-3.5 w-3.5" />
          <span className="text-[13px]">Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
