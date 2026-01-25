import * as React from "react";
import { LuCheck, LuX, LuTrash2, LuPlay } from "react-icons/lu";
import { cn } from "../lib/utils";
import { BulkActionsMenu } from "./BulkActionsMenu";

interface BatchOperationsPanelProps {
  selectedCount: number;
  onRunSelected?: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onEnableAll?: () => void;
  onDisableAll?: () => void;
  onMoveToTop?: () => void;
  onMoveToBottom?: () => void;
  onDuplicateAll?: () => void;
  onShuffle?: () => void;
  onRandomPresetToEach?: () => void;
  className?: string;
}

export function BatchOperationsPanel({
  selectedCount,
  onRunSelected,
  onDeleteSelected,
  onClearSelection,
  onEnableAll,
  onDisableAll,
  onMoveToTop,
  onMoveToBottom,
  onDuplicateAll,
  onShuffle,
  onRandomPresetToEach,
  className,
}: BatchOperationsPanelProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md bg-primary py-2 px-3",
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
        {onRunSelected && (
          <button
            onClick={onRunSelected}
            className="flex h-7 items-center gap-1 rounded-md bg-primary-foreground px-2.5"
          >
            <LuPlay className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary">Run</span>
          </button>
        )}

        <BulkActionsMenu
          selectedCount={selectedCount}
          onEnableAll={onEnableAll}
          onDisableAll={onDisableAll}
          onMoveToTop={onMoveToTop}
          onMoveToBottom={onMoveToBottom}
          onDuplicateAll={onDuplicateAll}
          onShuffle={onShuffle}
          onRandomPresetToEach={onRandomPresetToEach}
          onDeleteAll={onDeleteSelected}
          className="h-7 border-0 bg-transparent text-primary-foreground hover:bg-primary-foreground/20"
        />

        <button
          onClick={onDeleteSelected}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-primary-foreground/20"
          title="Delete selected"
        >
          <LuTrash2 className="h-3.5 w-3.5 text-primary-foreground" />
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
