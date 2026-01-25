import * as React from "react";
import { LuLoader, LuSparkles } from "react-icons/lu";
import { cn } from "../lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading your queue...",
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <LuLoader
            className="absolute inset-0 w-16 h-16 text-primary animate-spin"
            strokeWidth={4}
          />
          <div className="absolute inset-2 rounded-full bg-primary/10" />
          <LuSparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <p className="text-[13px] font-medium text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
