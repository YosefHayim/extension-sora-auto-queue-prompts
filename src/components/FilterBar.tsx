import {
  FaFilter,
  FaTimes,
  FaList,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTh,
  FaVideo,
  FaImage,
} from "react-icons/fa";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import type { GeneratedPrompt } from "../types"
import { cn } from "../lib/utils"

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

const statusConfig = {
  all: { icon: FaList, label: "All", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  pending: {
    icon: FaClock,
    label: "Pending",
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  },
  processing: {
    icon: FaSpinner,
    label: "Processing",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  },
  completed: {
    icon: FaCheckCircle,
    label: "Completed",
    color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
  failed: {
    icon: FaTimesCircle,
    label: "Failed",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
};

const mediaTypeConfig = {
  all: { icon: FaTh, label: "All Types", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  video: {
    icon: FaVideo,
    label: "Video",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  image: {
    icon: FaImage,
    label: "Image",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  },
};

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
        <FaFilter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
      </div>

      <div className="flex gap-1">
        {(["all", "pending", "processing", "completed", "failed"] as StatusFilter[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = statusFilter === status;

          return (
            <HoverCard key={status}>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusFilterChange(status)}
                  className={cn(
                    "h-7 text-xs gap-1.5 transition-colors border",
                    isActive
                      ? config.color + " border-transparent"
                      : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      status === "processing" && isActive && "animate-spin"
                    )}
                  />
                  {config.label}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Filter: {config.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {status === "all" && "Show all prompts regardless of status"}
                    {status === "pending" && "Show prompts waiting to be processed"}
                    {status === "processing" && "Show prompts currently being generated"}
                    {status === "completed" && "Show successfully completed prompts"}
                    {status === "failed" && "Show prompts that failed during processing"}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>

      <div className="flex gap-1 ml-2">
        {(["all", "video", "image"] as MediaTypeFilter[]).map((type) => {
          const config = mediaTypeConfig[type];
          const Icon = config.icon;
          const isActive = mediaTypeFilter === type;

          return (
            <HoverCard key={type}>
              <HoverCardTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMediaTypeFilterChange(type)}
                  className={cn(
                    "h-7 text-xs gap-1.5 transition-colors border",
                    isActive
                      ? config.color + " border-transparent"
                      : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Filter: {config.label}</h4>
                  <p className="text-xs text-muted-foreground">
                    {type === "all" && "Show all prompts regardless of media type"}
                    {type === "video" && "Show only video generation prompts"}
                    {type === "image" && "Show only image generation prompts"}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>

      <Badge
        variant="secondary"
        className="text-xs bg-muted text-muted-foreground border border-border ml-auto"
      >
        {filteredCount === 1 ? "1 prompt" : `${filteredCount} prompts`}
      </Badge>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1">
          <FaTimes className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
