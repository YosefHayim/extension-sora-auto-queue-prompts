import * as React from "react";
import { FaChevronDown, FaChevronRight, FaEdit, FaTrash } from "react-icons/fa";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface BatchHeaderProps {
  batchLabel: string;
  promptCount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function BatchHeader({
  batchLabel,
  promptCount,
  pendingCount,
  processingCount,
  completedCount,
  failedCount,
  isOpen,
  onToggle,
  onRename,
  onDelete,
}: BatchHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3 hover:bg-muted/70 transition-colors">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 flex-1 text-left"
      >
        {isOpen ? (
          <FaChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FaChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-semibold">{batchLabel}</span>
        <Badge variant="secondary" className="ml-2">
          {promptCount} prompt{promptCount !== 1 ? "s" : ""}
        </Badge>
      </button>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <Badge variant="outline">{pendingCount} pending</Badge>
        )}
        {processingCount > 0 && (
          <Badge className="bg-blue-500 text-white">
            {processingCount} processing
          </Badge>
        )}
        {completedCount > 0 && (
          <Badge className="bg-green-500 text-white">
            {completedCount} done
          </Badge>
        )}
        {failedCount > 0 && (
          <Badge variant="destructive">{failedCount} failed</Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          title="Rename batch"
        >
          <FaEdit className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete batch"
        >
          <FaTrash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
