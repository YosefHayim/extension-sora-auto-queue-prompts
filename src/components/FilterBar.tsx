import { Filter, X } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { GeneratedPrompt } from "@/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed";
type MediaTypeFilter = "all" | "video" | "image";

interface FilterBarProps {
  statusFilter: StatusFilter;
  mediaTypeFilter: MediaTypeFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onMediaTypeFilterChange: (filter: MediaTypeFilter) => void;
  promptCount: number;
  filteredCount: number;
  className?: string;
}

export function FilterBar({
  statusFilter,
  mediaTypeFilter,
  onStatusFilterChange,
  onMediaTypeFilterChange,
  promptCount,
  filteredCount,
  className,
}: FilterBarProps) {
  const hasActiveFilters = statusFilter !== "all" || mediaTypeFilter !== "all";

  const clearFilters = () => {
    onStatusFilterChange("all");
    onMediaTypeFilterChange("all");
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
      </div>

      <div className="flex gap-1">
        {(["all", "pending", "processing", "completed", "failed"] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusFilterChange(status)}
            className="h-7 text-xs"
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex gap-1 ml-2">
        {(["all", "video", "image"] as MediaTypeFilter[]).map((type) => (
          <Button
            key={type}
            variant={mediaTypeFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => onMediaTypeFilterChange(type)}
            className="h-7 text-xs"
          >
            {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {hasActiveFilters && (
        <>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1">
            <X className="h-3 w-3" />
            Clear
          </Button>
          <Badge variant="secondary" className="text-xs">
            {filteredCount} of {promptCount}
          </Badge>
        </>
      )}
    </div>
  );
}
