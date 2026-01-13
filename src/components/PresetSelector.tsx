import * as React from "react";
import { FaDice, FaPalette } from "react-icons/fa";
import type { PresetAssignment, SoraPreset } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

interface PresetSelectorProps {
  value: PresetAssignment;
  onChange: (preset: PresetAssignment) => void;
  availablePresets: SoraPreset[];
  disabled?: boolean;
  compact?: boolean;
}

export function PresetSelector({
  value,
  onChange,
  availablePresets,
  disabled = false,
  compact = false,
}: PresetSelectorProps) {
  const selectedPreset = availablePresets.find((p) => p.id === value);
  const displayName =
    value === "random"
      ? "Random"
      : value === "none"
        ? "None"
        : selectedPreset?.name || value;

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border",
            "hover:bg-accent transition-colors",
            value === "random" && "text-purple-600 border-purple-300",
            value !== "none" &&
              value !== "random" &&
              "text-orange-600 border-orange-300",
            value === "none" && "text-muted-foreground border-border",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {value === "random" ? (
            <FaDice className="h-3 w-3" />
          ) : (
            <FaPalette className="h-3 w-3" />
          )}
          <span className="max-w-[60px] truncate">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[300px] overflow-y-auto"
        >
          <DropdownMenuItem onSelect={() => onChange("none")}>
            <span className="text-muted-foreground">None</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onChange("random")}>
            <FaDice className="h-3.5 w-3.5 mr-2 text-purple-500" />
            Random
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {availablePresets
            .filter((p) => p.id !== "none")
            .map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onSelect={() => onChange(preset.id)}
              >
                <FaPalette className="h-3.5 w-3.5 mr-2 text-orange-500" />
                {preset.name}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PresetAssignment)}
      disabled={disabled}
      className={cn(
        "h-8 text-sm rounded-md border px-2 bg-background",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <option value="none">No Preset</option>
      <option value="random">🎲 Random</option>
      {availablePresets
        .filter((p) => p.id !== "none")
        .map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
    </select>
  );
}
