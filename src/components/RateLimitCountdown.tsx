import * as React from "react";
import { FaClock, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import type { RateLimitState } from "../types";

interface RateLimitCountdownProps {
  rateLimitState: RateLimitState;
  onDismiss?: () => void;
  compact?: boolean;
}

function formatTimeRemaining(resetAt: string): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
} {
  const resetTime = new Date(resetAt).getTime();
  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds, isExpired: false };
}

function formatCountdown(
  hours: number,
  minutes: number,
  seconds: number,
): string {
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

export function RateLimitCountdown({
  rateLimitState,
  onDismiss,
  compact = false,
}: RateLimitCountdownProps) {
  const [timeRemaining, setTimeRemaining] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (!rateLimitState.isLimited || !rateLimitState.resetAt) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = formatTimeRemaining(rateLimitState.resetAt!);
      setTimeRemaining(remaining);

      if (remaining.isExpired && onDismiss) {
        onDismiss();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [rateLimitState.isLimited, rateLimitState.resetAt, onDismiss]);

  if (!rateLimitState.isLimited) {
    return null;
  }

  if (timeRemaining?.isExpired) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20",
          compact && "p-2",
        )}
      >
        <FaClock className="h-4 w-4 text-green-500 flex-shrink-0" />
        <span className="text-sm text-green-600 dark:text-green-400">
          Rate limit has reset! You can generate again.
        </span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-auto h-6 w-6 p-0"
          >
            <FaTimes className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <FaExclamationTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-amber-600 dark:text-amber-400">
            Rate limited
          </span>
          {timeRemaining && (
            <span className="font-mono font-medium text-amber-700 dark:text-amber-300">
              {formatCountdown(
                timeRemaining.hours,
                timeRemaining.minutes,
                timeRemaining.seconds,
              )}
            </span>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-auto h-5 w-5 p-0"
          >
            <FaTimes className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-start gap-2">
        <FaExclamationTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Daily Generation Limit Reached
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            {rateLimitState.message ||
              "You've reached your daily generation limit."}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <FaTimes className="h-3 w-3" />
          </Button>
        )}
      </div>

      {timeRemaining && (
        <div className="flex items-center justify-center gap-3 py-2 px-3 bg-background/50 rounded-md">
          <FaClock className="h-4 w-4 text-amber-500" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground">Resets in:</span>
            <span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
              {String(timeRemaining.hours).padStart(2, "0")}:
              {String(timeRemaining.minutes).padStart(2, "0")}:
              {String(timeRemaining.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      )}

      {rateLimitState.maxCredits && (
        <p className="text-xs text-center text-muted-foreground">
          Credits: {rateLimitState.remainingCredits ?? 0} /{" "}
          {rateLimitState.maxCredits}
        </p>
      )}
    </div>
  );
}
