import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  LuChevronLeft,
  LuChevronRight,
  LuImagePlus,
  LuPalette,
  LuDices,
  LuFilm,
  LuLayers,
  LuSignal,
  LuCopy,
  LuShuffle,
  LuSparkles,
  LuWand,
  LuUndo2,
  LuCheck,
  LuX,
  LuArrowUp,
  LuArrowDown,
  LuTag,
  LuDownload,
  LuTrash2,
} from "react-icons/lu";
import { FaCircle } from "react-icons/fa";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface BulkActionsMenuProps {
  selectedCount: number;
  onAddPrefix?: () => void;
  onAddSuffix?: () => void;
  onAddImageToAll?: () => void;
  onSetPresetForAll?: () => void;
  onRandomPresetToEach?: () => void;
  onSetMediaType?: () => void;
  onSetVariations?: () => void;
  onSetPriority?: () => void;
  onDuplicateAll?: () => void;
  onShuffle?: () => void;
  onEnhanceAll?: () => void;
  onGenerateSimilar?: () => void;
  onResetToOriginal?: () => void;
  onEnableAll?: () => void;
  onDisableAll?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onCreateBatch?: () => void;
  onExportTo?: () => void;
  onDeleteAll?: () => void;
  className?: string;
}

export function BulkActionsMenu({
  selectedCount,
  onAddPrefix,
  onAddSuffix,
  onAddImageToAll,
  onSetPresetForAll,
  onRandomPresetToEach,
  onSetMediaType,
  onSetVariations,
  onSetPriority,
  onDuplicateAll,
  onShuffle,
  onEnhanceAll,
  onGenerateSimilar,
  onResetToOriginal,
  onEnableAll,
  onDisableAll,
  onMoveToTop,
  onMoveToBottom,
  onCreateBatch,
  onExportTo,
  onDeleteAll,
  className,
}: BulkActionsMenuProps) {
  if (selectedCount === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          Actions
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
            {selectedCount}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[200px] max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          Text Operations
        </DropdownMenuLabel>

        {onAddPrefix && (
          <DropdownMenuItem onClick={onAddPrefix} className="gap-2.5">
            <LuChevronLeft className="h-3.5 w-3.5" />
            <span className="text-[13px]">Add prefix</span>
          </DropdownMenuItem>
        )}

        {onAddSuffix && (
          <DropdownMenuItem onClick={onAddSuffix} className="gap-2.5">
            <LuChevronRight className="h-3.5 w-3.5" />
            <span className="text-[13px]">Add suffix</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          Media & Settings
        </DropdownMenuLabel>

        {onAddImageToAll && (
          <DropdownMenuItem onClick={onAddImageToAll} className="gap-2.5">
            <LuImagePlus className="h-3.5 w-3.5" />
            <span className="text-[13px]">Add image to all</span>
          </DropdownMenuItem>
        )}

        {onSetPresetForAll && (
          <DropdownMenuItem onClick={onSetPresetForAll} className="gap-2.5">
            <LuPalette className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[13px]">Set preset for all</span>
          </DropdownMenuItem>
        )}

        {onRandomPresetToEach && (
          <DropdownMenuItem onClick={onRandomPresetToEach} className="gap-2.5">
            <LuDices className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-[13px]">Random preset to each</span>
          </DropdownMenuItem>
        )}

        {onSetMediaType && (
          <DropdownMenuItem onClick={onSetMediaType} className="gap-2.5">
            <LuFilm className="h-3.5 w-3.5" />
            <span className="text-[13px]">Set media type</span>
          </DropdownMenuItem>
        )}

        {onSetVariations && (
          <DropdownMenuItem onClick={onSetVariations} className="gap-2.5">
            <LuLayers className="h-3.5 w-3.5" />
            <span className="text-[13px]">Set variations</span>
          </DropdownMenuItem>
        )}

        {onSetPriority && (
          <DropdownMenuItem onClick={onSetPriority} className="gap-2.5">
            <LuSignal className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[13px]">Set priority</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          Order & Organization
        </DropdownMenuLabel>

        {onDuplicateAll && (
          <DropdownMenuItem onClick={onDuplicateAll} className="gap-2.5">
            <LuCopy className="h-3.5 w-3.5" />
            <span className="text-[13px]">Duplicate all</span>
          </DropdownMenuItem>
        )}

        {onShuffle && (
          <DropdownMenuItem onClick={onShuffle} className="gap-2.5">
            <LuShuffle className="h-3.5 w-3.5" />
            <span className="text-[13px]">Shuffle</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          AI Enhancement
        </DropdownMenuLabel>

        {onEnhanceAll && (
          <DropdownMenuItem onClick={onEnhanceAll} className="gap-2.5">
            <LuSparkles className="h-3.5 w-3.5 text-cyan-500" />
            <span className="text-[13px]">Enhance all</span>
          </DropdownMenuItem>
        )}

        {onGenerateSimilar && (
          <DropdownMenuItem onClick={onGenerateSimilar} className="gap-2.5">
            <LuWand className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[13px]">Generate similar</span>
          </DropdownMenuItem>
        )}

        {onResetToOriginal && (
          <DropdownMenuItem onClick={onResetToOriginal} className="gap-2.5">
            <LuUndo2 className="h-3.5 w-3.5" />
            <span className="text-[13px]">Reset to original</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          Queue Operations
        </DropdownMenuLabel>

        {onEnableAll && (
          <DropdownMenuItem onClick={onEnableAll} className="gap-2.5">
            <FaCircle className="h-2.5 w-2.5 text-green-500" />
            <span className="text-[13px]">Enable all</span>
          </DropdownMenuItem>
        )}

        {onDisableAll && (
          <DropdownMenuItem onClick={onDisableAll} className="gap-2.5">
            <FaCircle className="h-2.5 w-2.5 text-gray-400" />
            <span className="text-[13px]">Disable all</span>
          </DropdownMenuItem>
        )}

        {onMoveToTop && (
          <DropdownMenuItem onClick={onMoveToTop} className="gap-2.5">
            <LuArrowUp className="h-3.5 w-3.5" />
            <span className="text-[13px]">Move to top</span>
          </DropdownMenuItem>
        )}

        {onMoveToBottom && (
          <DropdownMenuItem onClick={onMoveToBottom} className="gap-2.5">
            <LuArrowDown className="h-3.5 w-3.5" />
            <span className="text-[13px]">Move to bottom</span>
          </DropdownMenuItem>
        )}

        {onCreateBatch && (
          <DropdownMenuItem onClick={onCreateBatch} className="gap-2.5">
            <LuTag className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[13px]">Create batch</span>
          </DropdownMenuItem>
        )}

        {onExportTo && (
          <DropdownMenuItem onClick={onExportTo} className="gap-2.5">
            <LuDownload className="h-3.5 w-3.5" />
            <span className="text-[13px]">Export selected</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-semibold text-red-500">
          Danger Zone
        </DropdownMenuLabel>

        {onDeleteAll && (
          <DropdownMenuItem
            onClick={onDeleteAll}
            className="gap-2.5 text-destructive focus:text-destructive"
          >
            <LuTrash2 className="h-3.5 w-3.5" />
            <span className="text-[13px]">Delete all selected</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
