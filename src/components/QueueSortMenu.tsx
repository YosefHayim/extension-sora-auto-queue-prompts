import * as React from "react";
import { FaSort } from "react-icons/fa";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type SortType =
  | "timestamp-asc"
  | "timestamp-desc"
  | "priority-desc"
  | "mediaType-video"
  | "mediaType-image"
  | "status-pending"
  | "batchLabel";

interface QueueSortMenuProps {
  onSort: (sortType: SortType) => void;
  currentSort?: SortType;
}

export function QueueSortMenu({ onSort, currentSort }: QueueSortMenuProps) {
  return (
    <Select value={currentSort} onValueChange={(v) => onSort(v as SortType)}>
      <SelectTrigger className="w-[180px]">
        <FaSort className="h-3 w-3 mr-2" />
        <SelectValue placeholder="Sort queue..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="timestamp-asc">Oldest First</SelectItem>
        <SelectItem value="timestamp-desc">Newest First</SelectItem>
        <SelectItem value="priority-desc">Priority (High → Low)</SelectItem>
        <SelectItem value="mediaType-video">Videos First</SelectItem>
        <SelectItem value="mediaType-image">Images First</SelectItem>
        <SelectItem value="status-pending">Pending First</SelectItem>
        <SelectItem value="batchLabel">Group by Batch</SelectItem>
      </SelectContent>
    </Select>
  );
}
