import * as React from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { FaCheckCircle, FaClock, FaFilter, FaImage, FaList, FaSpinner, FaTh, FaTimes, FaTimesCircle, FaVideo } from "react-icons/fa";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed";
type MediaTypeFilter = "all" | "video" | "image";

interface FilterDropdownProps {
  statusFilter: StatusFilter;
  mediaTypeFilter: MediaTypeFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onMediaTypeFilterChange: (filter: MediaTypeFilter) => void;
  promptCount: number;
  filteredCount: number;
  className?: string;
}

const statusConfig = {
  all: { icon: FaList, label: "All", color: "text-blue-600 dark:text-blue-400" },
  pending: {
    icon: FaClock,
    label: "Pending",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  processing: {
    icon: FaSpinner,
    label: "Processing",
    color: "text-purple-600 dark:text-purple-400",
  },
  completed: {
    icon: FaCheckCircle,
    label: "Completed",
    color: "text-green-600 dark:text-green-400",
  },
  failed: {
    icon: FaTimesCircle,
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
  },
};

const mediaTypeConfig = {
  all: { icon: FaTh, label: "All Types", color: "text-slate-600 dark:text-slate-400" },
  video: {
    icon: FaVideo,
    label: "Video",
    color: "text-blue-600 dark:text-blue-400",
  },
  image: {
    icon: FaImage,
    label: "Image",
    color: "text-purple-600 dark:text-purple-400",
  },
};

export function FilterDropdown({
  statusFilter,
  mediaTypeFilter,
  onStatusFilterChange,
  onMediaTypeFilterChange,
  promptCount,
  filteredCount,
  className,
}: FilterDropdownProps) {
  const hasActiveFilters = statusFilter !== "all" || mediaTypeFilter !== "all";

  const clearFilters = () => {
    onStatusFilterChange("all");
    onMediaTypeFilterChange("all");
  };

  const StatusIcon = statusConfig[statusFilter].icon;
  const MediaTypeIcon = mediaTypeConfig[mediaTypeFilter].icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <FaFilter className="h-3.5 w-3.5" />
            <span className="text-xs">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
                {statusFilter !== "all" && mediaTypeFilter !== "all" ? "2" : "1"}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {(["all", "pending", "processing", "completed", "failed"] as StatusFilter[]).map((status) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = statusFilter === status;

            return (
              <DropdownMenuItem key={status} onSelect={() => onStatusFilterChange(status)} className={cn("gap-2 cursor-pointer", isActive && "bg-accent")}>
                <Icon className={cn("h-4 w-4", config.color, status === "processing" && isActive && "animate-spin")} />
                <span>{config.label}</span>
                {isActive && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Media Type</DropdownMenuLabel>
          {(["all", "video", "image"] as MediaTypeFilter[]).map((type) => {
            const config = mediaTypeConfig[type];
            const Icon = config.icon;
            const isActive = mediaTypeFilter === type;

            return (
              <DropdownMenuItem key={type} onSelect={() => onMediaTypeFilterChange(type)} className={cn("gap-2 cursor-pointer", isActive && "bg-accent")}>
                <Icon className={cn("h-4 w-4", config.color)} />
                <span>{config.label}</span>
                {isActive && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            );
          })}
          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={clearFilters} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <FaTimes className="h-4 w-4" />
                <span>Clear Filters</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border border-border">
        {filteredCount === 1 ? "1 prompt" : `${filteredCount} prompts`}
      </Badge>
    </div>
  );
}
