import { LuInbox, LuSparkles, LuUpload } from "react-icons/lu";
import { Button } from "./ui/button";
import { log } from "../utils/logger";
import { cn } from "../lib/utils";

interface EmptyStateProps {
  onGenerate: () => void;
  onImport: () => void;
  onManual?: () => void;
  className?: string;
}

export function EmptyState({
  onGenerate,
  onImport,
  className,
}: EmptyStateProps) {
  const handleGenerate = () => {
    log.ui.action("EmptyState:Generate");
    onGenerate();
  };

  const handleImport = () => {
    log.ui.action("EmptyState:Import");
    onImport();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <LuInbox className="h-7 w-7 text-muted-foreground" />
      </div>

      <h3 className="text-base font-semibold text-foreground">
        No prompts yet
      </h3>

      <p className="max-w-[220px] text-center text-[13px] leading-relaxed text-muted-foreground">
        Generate AI prompts or import from CSV to get started
      </p>

      <div className="flex items-center gap-2">
        <Button onClick={handleGenerate} className="gap-1.5">
          <LuSparkles className="h-4 w-4" />
          Generate
        </Button>
        <Button variant="outline" onClick={handleImport} className="gap-1.5">
          <LuUpload className="h-4 w-4" />
          Import
        </Button>
      </div>
    </div>
  );
}
