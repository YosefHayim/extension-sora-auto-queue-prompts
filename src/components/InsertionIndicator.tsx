import * as React from "react";
import { FaPlus } from "react-icons/fa";

interface InsertionIndicatorProps {
  count: number;
  position: number;
  totalPrompts: number;
}

export function InsertionIndicator({
  count,
  position,
  totalPrompts,
}: InsertionIndicatorProps) {
  return (
    <div className="relative my-2 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t-2 border-dashed border-blue-500 animate-pulse" />
      </div>
      <div className="relative flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg animate-bounce">
        <FaPlus className="h-4 w-4" />
        <span className="text-sm font-medium">
          {count} prompt{count !== 1 ? "s" : ""} will be added here
        </span>
        <span className="text-xs opacity-75">
          (Position {position} of {totalPrompts + count})
        </span>
      </div>
    </div>
  );
}
