import * as React from "react";
import {
  LuCheck,
  LuX,
  LuTrash2,
  LuPlay,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuImagePlus,
  LuImageMinus,
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
  LuArrowUpToLine,
  LuArrowDownToLine,
  LuArrowDownAZ,
  LuArrowUpZA,
  LuTag,
  LuDownload,
  LuReplace,
  LuCirclePlus,
  LuCircleMinus,
  LuRatio,
  LuCircleCheck,
  LuCircleX,
} from "react-icons/lu";
import { cn } from "../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface BatchOperationsPanelProps {
  selectedCount: number;
  onRunSelected?: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onAddPrefix?: () => void;
  onAddSuffix?: () => void;
  onSearchReplace?: () => void;
  onAddPositivePrompt?: () => void;
  onAddNegativePrompt?: () => void;
  onAddImageToAll?: () => void;
  onSetPresetForAll?: () => void;
  onRandomPresetToEach?: () => void;
  onSetMediaType?: () => void;
  onSetAspectRatio?: () => void;
  onSetVariations?: () => void;
  onSetPriority?: () => void;
  onDuplicateAll?: () => void;
  onShuffle?: () => void;
  onSortAZ?: () => void;
  onSortZA?: () => void;
  onEnhanceAll?: () => void;
  onGenerateSimilar?: () => void;
  onResetToOriginal?: () => void;
  onEnableAll?: () => void;
  onDisableAll?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onMoveToPosition?: (position: number) => Promise<void>;
  onCreateBatch?: () => void;
  onExportTo?: () => void;
  onClearAttachedImages?: () => void;
  totalPrompts?: number;
  className?: string;
}

export function BatchOperationsPanel({
  selectedCount,
  onRunSelected,
  onDeleteSelected,
  onClearSelection,
  onAddPrefix,
  onAddSuffix,
  onSearchReplace,
  onAddPositivePrompt,
  onAddNegativePrompt,
  onAddImageToAll,
  onSetPresetForAll,
  onRandomPresetToEach,
  onSetMediaType,
  onSetAspectRatio,
  onSetVariations,
  onSetPriority,
  onDuplicateAll,
  onShuffle,
  onSortAZ,
  onSortZA,
  onEnhanceAll,
  onGenerateSimilar,
  onResetToOriginal,
  onEnableAll,
  onDisableAll,
  onMoveToTop,
  onMoveToBottom,
  onCreateBatch,
  onExportTo,
  onClearAttachedImages,
  className,
}: BatchOperationsPanelProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg bg-primary py-2 px-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-[18px] w-[18px] items-center justify-center rounded bg-primary-foreground">
          <LuCheck className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[13px] font-semibold text-primary-foreground">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-7 items-center gap-1 rounded-md bg-primary-foreground py-1.5 px-2.5">
              <span className="text-xs font-semibold text-primary">
                Actions
              </span>
              <LuChevronDown className="h-3 w-3 text-primary" />
            </button>
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

            {onSearchReplace && (
              <DropdownMenuItem onClick={onSearchReplace} className="gap-2.5">
                <LuReplace className="h-3.5 w-3.5" />
                <span className="text-[13px]">Search & replace</span>
              </DropdownMenuItem>
            )}

            {onAddPositivePrompt && (
              <DropdownMenuItem
                onClick={onAddPositivePrompt}
                className="gap-2.5"
              >
                <LuCirclePlus className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[13px]">Positive prompt</span>
              </DropdownMenuItem>
            )}

            {onAddNegativePrompt && (
              <DropdownMenuItem
                onClick={onAddNegativePrompt}
                className="gap-2.5"
              >
                <LuCircleMinus className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[13px]">Negative prompt</span>
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
              <DropdownMenuItem
                onClick={onRandomPresetToEach}
                className="gap-2.5"
              >
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

            {onSetAspectRatio && (
              <DropdownMenuItem onClick={onSetAspectRatio} className="gap-2.5">
                <LuRatio className="h-3.5 w-3.5" />
                <span className="text-[13px]">Set aspect ratio</span>
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

            {onSortAZ && (
              <DropdownMenuItem onClick={onSortAZ} className="gap-2.5">
                <LuArrowDownAZ className="h-3.5 w-3.5" />
                <span className="text-[13px]">Sort A-Z</span>
              </DropdownMenuItem>
            )}

            {onSortZA && (
              <DropdownMenuItem onClick={onSortZA} className="gap-2.5">
                <LuArrowUpZA className="h-3.5 w-3.5" />
                <span className="text-[13px]">Sort Z-A</span>
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
                <LuCircleCheck className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[13px]">Enable all</span>
              </DropdownMenuItem>
            )}

            {onDisableAll && (
              <DropdownMenuItem onClick={onDisableAll} className="gap-2.5">
                <LuCircleX className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-[13px]">Disable all</span>
              </DropdownMenuItem>
            )}

            {onMoveToTop && (
              <DropdownMenuItem onClick={onMoveToTop} className="gap-2.5">
                <LuArrowUpToLine className="h-3.5 w-3.5" />
                <span className="text-[13px]">Move to top</span>
              </DropdownMenuItem>
            )}

            {onMoveToBottom && (
              <DropdownMenuItem onClick={onMoveToBottom} className="gap-2.5">
                <LuArrowDownToLine className="h-3.5 w-3.5" />
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

            <DropdownMenuLabel className="text-[11px] font-semibold text-destructive">
              Danger Zone
            </DropdownMenuLabel>

            {onClearAttachedImages && (
              <DropdownMenuItem
                onClick={onClearAttachedImages}
                className="gap-2.5 text-orange-500 focus:text-orange-500"
              >
                <LuImageMinus className="h-3.5 w-3.5" />
                <span className="text-[13px]">Clear attached images</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={onDeleteSelected}
              className="gap-2.5 text-destructive focus:text-destructive"
            >
              <LuTrash2 className="h-3.5 w-3.5" />
              <span className="text-[13px]">Delete all selected</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onRunSelected && (
          <button
            onClick={onRunSelected}
            className="flex h-7 items-center gap-1 rounded-md bg-primary-foreground py-1.5 px-2.5"
          >
            <LuPlay className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary">Run</span>
          </button>
        )}

        <button
          onClick={onDeleteSelected}
          className="group flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/20"
          title="Delete selected"
        >
          <LuTrash2 className="h-3.5 w-3.5 text-primary-foreground group-hover:text-destructive" />
        </button>

        <button
          onClick={onClearSelection}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-primary-foreground/20"
          title="Clear selection"
        >
          <LuX className="h-3.5 w-3.5 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
