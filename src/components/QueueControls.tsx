import * as React from "react";

import { Card, CardContent, CardHeader } from "./ui/card";
import {
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaPause,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import type { GeneratedPrompt, QueueState } from "../types";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "../lib/utils";
import { log } from "../utils/logger";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

interface QueueControlsProps {
  queueState: QueueState;
  totalCount: number;
  prompts?: GeneratedPrompt[]; // Optional prompts array to calculate current progress
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onCleanCompletedAndFailed?: () => void;
  completedCount?: number;
  failedCount?: number;
}

export function QueueControls({
  queueState,
  totalCount,
  prompts = [],
  onStart,
  onPause,
  onResume,
  onStop,
  onCleanCompletedAndFailed,
  completedCount = 0,
  failedCount = 0,
}: QueueControlsProps) {
  // Calculate progress including current processing prompt's progress
  const calculateProgress = (): number => {
    if (totalCount === 0) return 0;

    // Base progress from completed/failed prompts
    let baseProgress = queueState.processedCount;

    // If there's a currently processing prompt, add its progress contribution
    if (queueState.currentPromptId && prompts.length > 0) {
      const currentPrompt = prompts.find(
        (p) => p.id === queueState.currentPromptId,
      );
      if (
        currentPrompt &&
        currentPrompt.status === "processing" &&
        currentPrompt.progress !== undefined
      ) {
        // Add the current prompt's progress as a fraction (0-1) of one prompt
        baseProgress += currentPrompt.progress / 100;
      }
    }

    return (baseProgress / totalCount) * 100;
  };

  const progress = calculateProgress();
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  // Calculate elapsed time from queue start
  React.useEffect(() => {
    if (
      !queueState.queueStartTime ||
      !queueState.isRunning ||
      queueState.isPaused
    ) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - queueState.queueStartTime!;
      setElapsedTime(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [queueState.queueStartTime, queueState.isRunning, queueState.isPaused]);

  const handleStartClick = () => {
    log.ui.action("QueueControls:Start", { totalCount });
    onStart();
  };

  const handlePauseClick = () => {
    log.ui.action("QueueControls:Pause", {
      processedCount: queueState.processedCount,
      totalCount,
    });
    onPause();
  };

  const handleResumeClick = () => {
    log.ui.action("QueueControls:Resume", {
      processedCount: queueState.processedCount,
      totalCount,
    });
    onResume();
  };

  const handleStopClick = () => {
    log.ui.action("QueueControls:Stop", {
      processedCount: queueState.processedCount,
      totalCount,
    });
    onStop();
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCleanClick = () => {
    if (onCleanCompletedAndFailed) {
      log.ui.action("QueueControls:CleanCompletedAndFailed", {
        completedCount,
        failedCount,
      });
      onCleanCompletedAndFailed();
    }
  };

  const hasCompletedOrFailed = (completedCount || 0) + (failedCount || 0) > 0;

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="pb-3 overflow-hidden">
        {/* Top row: Toggle button (left), Small circle, Status, and Timer (right) */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="h-6 w-6 p-0 flex-shrink-0"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <FaChevronDown className="h-3 w-3" />
              ) : (
                <FaChevronUp className="h-3 w-3" />
              )}
            </Button>
            {/* Status icon with hover tooltip */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex-shrink-0 cursor-help">
                  {queueState.isRunning && !queueState.isPaused ? (
                    <FaPlay className={cn("h-3 w-3 text-green-500")} />
                  ) : queueState.isRunning && queueState.isPaused ? (
                    <FaPause className={cn("h-3 w-3 text-yellow-500")} />
                  ) : (
                    <FaStop className={cn("h-3 w-3 text-gray-500")} />
                  )}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <p className="text-xs font-medium">
                  {queueState.isRunning && !queueState.isPaused
                    ? "Running"
                    : queueState.isRunning && queueState.isPaused
                      ? "Paused"
                      : "Stopped"}
                </p>
              </HoverCardContent>
            </HoverCard>
            <span className="text-sm font-medium text-foreground">
              {queueState.processedCount} / {totalCount} prompts
            </span>
          </div>

          {/* Timer at top right */}
          {queueState.isRunning &&
            queueState.queueStartTime &&
            !queueState.isPaused && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 cursor-help flex-shrink-0"
                  >
                    <FaClock className="h-3 w-3" />
                    {formatDuration(elapsedTime)}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Queue Timer</h4>
                    <p className="text-xs text-muted-foreground">
                      Total elapsed time since the queue started. This timer
                      resets when the queue stops or finishes.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Started:{" "}
                      {new Date(queueState.queueStartTime).toLocaleTimeString()}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
        </div>

        {/* Buttons row */}
        {!isCollapsed && (
          <div className="flex gap-2 flex-shrink-0 justify-end">
            {!queueState.isRunning && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    onClick={handleStartClick}
                    size="sm"
                    className="min-w-[80px]"
                  >
                    <FaPlay className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Start Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Begin processing all pending prompts in the queue. Prompts
                      will be processed sequentially with configurable delays.
                    </p>
                    {totalCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {totalCount} prompt{totalCount !== 1 ? "s" : ""} ready
                        to process
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={handlePauseClick}
                    size="sm"
                    className="min-w-[80px]"
                  >
                    <FaPause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Pause Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Temporarily pause the queue. The current prompt will
                      finish, but no new prompts will be processed until
                      resumed.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      onClick={handleResumeClick}
                      size="sm"
                      className="min-w-[80px]"
                    >
                      <FaPlay className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Resume Queue</h4>
                      <p className="text-xs text-muted-foreground">
                        Continue processing prompts from where you left off. The
                        queue will resume with the next pending prompt.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                {hasCompletedOrFailed && onCleanCompletedAndFailed && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleCleanClick}
                        size="sm"
                        className="min-w-[80px]"
                      >
                        <FaTrash className="h-4 w-4 mr-2" />
                        Clean
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          Clean Completed & Failed
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Remove all completed and failed prompts from the
                          queue. This action cannot be undone.
                        </p>
                        {(completedCount > 0 || failedCount > 0) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {completedCount} completed, {failedCount} failed
                          </p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </>
            )}
            {queueState.isRunning && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={handleStopClick}
                    size="sm"
                    className="min-w-[80px]"
                  >
                    <FaStop className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Stop Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Stop the queue completely. The current prompt will finish,
                      but the queue will not process any more prompts.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Timer will reset when stopped.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        )}
      </CardHeader>

      {!isCollapsed && queueState.isRunning && totalCount > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Percentage above progress bar, aligned right */}
            <div className="flex justify-end">
              {totalCount > 0 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.round(progress)}% complete
                </span>
              )}
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{queueState.processedCount} processed</span>
              <span>{totalCount - queueState.processedCount} remaining</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
