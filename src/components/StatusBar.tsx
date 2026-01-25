import { cn } from "../lib/utils";

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  className?: string;
}

export function StatusBar({
  pendingCount,
  processingCount,
  completedCount,
  className,
}: StatusBarProps) {
  const total = pendingCount + processingCount + completedCount;

  if (total === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-around gap-2 rounded-md bg-muted px-3 py-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">
          {pendingCount}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-[13px] font-semibold text-foreground">
          {processingCount}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-[13px] font-semibold text-foreground">
          {completedCount}
        </span>
      </div>
    </div>
  );
}
