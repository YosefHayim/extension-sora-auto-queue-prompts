import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { FaFilter, FaTimes } from "react-icons/fa";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
  STATUS_CONFIG,
  MEDIA_TYPE_CONFIG,
  type StatusFilter,
  type MediaTypeFilter,
} from "../constants/filterConfig";

interface FilterDropdownProps {
  statusFilter: StatusFilter;
  mediaTypeFilter: MediaTypeFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onMediaTypeFilterChange: (filter: MediaTypeFilter) => void;
  promptCount: number;
  filteredCount: number;
  className?: string;
}

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

  const StatusIcon = STATUS_CONFIG[statusFilter].icon;
  const MediaTypeIcon = MEDIA_TYPE_CONFIG[mediaTypeFilter].icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <FaFilter className="h-3.5 w-3.5" />
            <span className="text-xs">Filters</span>
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-4 px-1.5 text-[10px]"
              >
                {statusFilter !== "all" && mediaTypeFilter !== "all"
                  ? "2"
                  : "1"}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {(
            [
              "all",
              "pending",
              "processing",
              "completed",
              "failed",
            ] as StatusFilter[]
          ).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isActive = statusFilter === status;

            return (
              <DropdownMenuItem
                key={status}
                onSelect={() => onStatusFilterChange(status)}
                className={cn("gap-2 cursor-pointer", isActive && "bg-accent")}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    config.textColor,
                    status === "processing" && isActive && "animate-spin",
                  )}
                />
                <span>{config.label}</span>
                {isActive && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Media Type</DropdownMenuLabel>
          {(["all", "video", "image"] as MediaTypeFilter[]).map((type) => {
            const config = MEDIA_TYPE_CONFIG[type];
            const Icon = config.icon;
            const isActive = mediaTypeFilter === type;

            return (
              <DropdownMenuItem
                key={type}
                onSelect={() => onMediaTypeFilterChange(type)}
                className={cn("gap-2 cursor-pointer", isActive && "bg-accent")}
              >
                <Icon className={cn("h-4 w-4", config.textColor)} />
                <span>{config.label}</span>
                {isActive && <span className="ml-auto text-xs">✓</span>}
              </DropdownMenuItem>
            );
          })}
          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={clearFilters}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <FaTimes className="h-4 w-4" />
                <span>Clear Filters</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge
        variant="secondary"
        className="text-xs bg-muted text-muted-foreground border border-border"
      >
        {filteredCount === 1 ? "1 prompt" : `${filteredCount} prompts`}
      </Badge>
    </div>
  );
}
