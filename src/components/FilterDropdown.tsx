import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LuFilter, LuX, LuCheck } from "react-icons/lu";
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
  filteredCount?: number;
  className?: string;
}

export function FilterDropdown({
  statusFilter,
  mediaTypeFilter,
  onStatusFilterChange,
  onMediaTypeFilterChange,
  className,
}: FilterDropdownProps) {
  const hasActiveFilters = statusFilter !== "all" || mediaTypeFilter !== "all";
  const filterCount =
    (statusFilter !== "all" ? 1 : 0) + (mediaTypeFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    onStatusFilterChange("all");
    onMediaTypeFilterChange("all");
  };

  return (
    <DropdownMenu className={className}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <LuFilter className="h-3.5 w-3.5" />
          <span className="text-[13px]">Filter</span>
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {filterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2 gap-1">
        <DropdownMenuLabel className="text-[12px] font-semibold text-muted-foreground">
          Filter by
        </DropdownMenuLabel>

        <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground pt-2">
          Status
        </DropdownMenuLabel>

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
              onClick={() => onStatusFilterChange(status)}
              className={cn("gap-2 rounded-md", isActive && "bg-accent")}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  config.textColor,
                  status === "processing" && isActive && "animate-spin",
                )}
              />
              <span className="text-[13px]">{config.label}</span>
              {isActive && (
                <LuCheck className="ml-auto h-3.5 w-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
          Media Type
        </DropdownMenuLabel>

        {(["all", "video", "image"] as MediaTypeFilter[]).map((type) => {
          const config = MEDIA_TYPE_CONFIG[type];
          const Icon = config.icon;
          const isActive = mediaTypeFilter === type;

          return (
            <DropdownMenuItem
              key={type}
              onClick={() => onMediaTypeFilterChange(type)}
              className={cn("gap-2 rounded-md", isActive && "bg-accent")}
            >
              <Icon className={cn("h-3.5 w-3.5", config.textColor)} />
              <span className="text-[13px]">{config.label}</span>
              {isActive && (
                <LuCheck className="ml-auto h-3.5 w-3.5 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={clearFilters}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LuX className="h-3.5 w-3.5" />
              <span className="text-[13px]">Clear filters</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
