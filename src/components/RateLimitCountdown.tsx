import * as React from "react";
import { LuTriangleAlert, LuX } from "react-icons/lu";
import { cn } from "../lib/utils";
import type { RateLimitState } from "../types";

interface RateLimitCountdownProps {
  rateLimitState: RateLimitState;
  onDismiss?: () => void;
  className?: string;
}

function formatTimeRemaining(resetAt: string): string {
  const resetTime = new Date(resetAt).getTime();
  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) return "now";

  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function RateLimitCountdown({
  rateLimitState,
  onDismiss,
  className,
}: RateLimitCountdownProps) {
  const [timeDisplay, setTimeDisplay] = React.useState<string>("");

  React.useEffect(() => {
    if (!rateLimitState.isLimited || !rateLimitState.resetAt) {
      setTimeDisplay("");
      return;
    }

    const updateCountdown = () => {
      const display = formatTimeRemaining(rateLimitState.resetAt!);
      setTimeDisplay(display);

      if (display === "now" && onDismiss) {
        onDismiss();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [rateLimitState.isLimited, rateLimitState.resetAt, onDismiss]);

  if (!rateLimitState.isLimited) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3",
        className,
      )}
    >
      <LuTriangleAlert className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />

      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
          Rate limit reached
        </span>
        {timeDisplay && (
          <span className="text-[12px] text-amber-700 dark:text-amber-400">
            Resumes in {timeDisplay}
          </span>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 text-amber-600 hover:bg-amber-200/50 dark:text-amber-500 dark:hover:bg-amber-800/50"
        >
          <LuX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
