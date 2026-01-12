import * as React from "react";
import { Badge } from "./ui/badge";
import { FaFire, FaArrowDown } from "react-icons/fa";

interface PriorityBadgeProps {
  priority?: "high" | "normal" | "low";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority || priority === "normal") return null;

  if (priority === "high") {
    return (
      <Badge
        variant="destructive"
        className="animate-pulse flex items-center gap-1"
      >
        <FaFire className="h-3 w-3" />
        High
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <FaArrowDown className="h-3 w-3" />
      Low
    </Badge>
  );
}
