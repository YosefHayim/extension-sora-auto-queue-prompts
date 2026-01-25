import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LuBraces, LuTable, LuFileText, LuDownload } from "react-icons/lu";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type ExportFormat = "json" | "csv" | "text";

interface ExportFormatDialogProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  className?: string;
}

export function ExportFormatDialog({
  onExport,
  disabled = false,
  className,
}: ExportFormatDialogProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("gap-2", className)}
        >
          <LuDownload className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
          Export Format
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={() => onExport("json")} className="gap-2.5">
          <LuBraces className="h-3.5 w-3.5 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-[13px]">JSON</span>
            <span className="text-[11px] text-muted-foreground">
              Structured data
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onExport("csv")} className="gap-2.5">
          <LuTable className="h-3.5 w-3.5 text-green-500" />
          <div className="flex flex-col">
            <span className="text-[13px]">CSV</span>
            <span className="text-[11px] text-muted-foreground">
              Spreadsheet format
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onExport("text")} className="gap-2.5">
          <LuFileText className="h-3.5 w-3.5 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[13px]">Plain Text</span>
            <span className="text-[11px] text-muted-foreground">
              One prompt per line
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
