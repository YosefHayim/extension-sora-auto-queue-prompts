import * as React from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheck,
  FaTimes,
  FaTrash,
  FaTag,
  FaFire,
} from "react-icons/fa";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface BatchOperationsPanelProps {
  selectedCount: number;
  onMoveToPosition: (position: number) => void;
  onCreateBatch: (label: string) => void;
  onSetPriority: (priority: "high" | "normal" | "low") => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  totalPrompts: number;
}

export function BatchOperationsPanel({
  selectedCount,
  onMoveToPosition,
  onCreateBatch,
  onSetPriority,
  onEnableAll,
  onDisableAll,
  onDeleteSelected,
  onClearSelection,
  totalPrompts,
}: BatchOperationsPanelProps) {
  const [batchName, setBatchName] = React.useState("");
  const [showBatchInput, setShowBatchInput] = React.useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 rounded-lg border border-blue-500 bg-blue-500/10 p-4 backdrop-blur-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {selectedCount} prompt{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <FaTimes className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select onValueChange={(value) => onMoveToPosition(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Move to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <div className="flex items-center gap-2">
                <FaArrowUp className="h-3 w-3" />
                Move to top
              </div>
            </SelectItem>
            <SelectItem value={String(totalPrompts)}>
              <div className="flex items-center gap-2">
                <FaArrowDown className="h-3 w-3" />
                Move to bottom
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => onSetPriority(v as "high" | "normal" | "low")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <FaFire className="h-3 w-3 text-red-500" />
                High Priority
              </div>
            </SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        {showBatchInput ? (
          <div className="col-span-2 flex gap-2">
            <Input
              placeholder="Batch name..."
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && batchName.trim()) {
                  onCreateBatch(batchName.trim());
                  setBatchName("");
                  setShowBatchInput(false);
                }
                if (e.key === "Escape") {
                  setShowBatchInput(false);
                }
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => {
                if (batchName.trim()) {
                  onCreateBatch(batchName.trim());
                  setBatchName("");
                  setShowBatchInput(false);
                }
              }}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBatchInput(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowBatchInput(true)}>
            <FaTag className="h-3 w-3 mr-2" />
            Create Batch
          </Button>
        )}

        <Button variant="destructive" onClick={onDeleteSelected}>
          <FaTrash className="h-3 w-3 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
