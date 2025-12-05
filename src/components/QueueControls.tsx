import * as React from "react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { FaClock, FaPause, FaPlay, FaStop } from "react-icons/fa";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import type { QueueState } from "../types";
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
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function QueueControls({ queueState, totalCount, onStart, onPause, onResume, onStop }: QueueControlsProps) {
  const progress = totalCount > 0 ? (queueState.processedCount / totalCount) * 100 : 0;
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);

  // Calculate elapsed time from queue start
  React.useEffect(() => {
    if (!queueState.queueStartTime || !queueState.isRunning || queueState.isPaused) {
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
    log.ui.action("QueueControls:Pause", { processedCount: queueState.processedCount, totalCount });
    onPause();
  };

  const handleResumeClick = () => {
    log.ui.action("QueueControls:Resume", { processedCount: queueState.processedCount, totalCount });
    onResume();
  };

  const handleStopClick = () => {
    log.ui.action("QueueControls:Stop", { processedCount: queueState.processedCount, totalCount });
    onStop();
  };

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="pb-3 overflow-hidden">
        <div className="flex items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Badge
              variant={queueState.isRunning ? "default" : "secondary"}
              className={cn(
                "text-sm font-semibold px-3 py-1 flex-shrink-0",
                queueState.isRunning && !queueState.isPaused && "bg-green-500 text-white animate-pulse",
                queueState.isRunning && queueState.isPaused && "bg-yellow-500 text-white",
                !queueState.isRunning && "bg-gray-500 text-white"
              )}
            >
              {queueState.isRunning ?
                queueState.isPaused ?
                  "⏸ Paused"
                : "▶ Running"
              : "⏹ Stopped"}
            </Badge>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {queueState.processedCount} / {totalCount} prompts
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {totalCount > 0 && <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(progress)}% complete</span>}
                {queueState.isRunning && queueState.queueStartTime && !queueState.isPaused && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="outline" className="text-xs gap-1.5 cursor-help flex-shrink-0">
                        <FaClock className="h-3 w-3" />
                        {formatDuration(elapsedTime)}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Queue Timer</h4>
                        <p className="text-xs text-muted-foreground">
                          Total elapsed time since the queue started. This timer resets when the queue stops or finishes.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">Started: {new Date(queueState.queueStartTime).toLocaleTimeString()}</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {!queueState.isRunning && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button onClick={handleStartClick} size="sm" className="min-w-[80px]">
                    <FaPlay className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Start Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Begin processing all pending prompts in the queue. Prompts will be processed sequentially with configurable delays.
                    </p>
                    {totalCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {totalCount} prompt{totalCount !== 1 ? "s" : ""} ready to process
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="secondary" onClick={handlePauseClick} size="sm" className="min-w-[80px]">
                    <FaPause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Pause Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Temporarily pause the queue. The current prompt will finish, but no new prompts will be processed until resumed.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button onClick={handleResumeClick} size="sm" className="min-w-[80px]">
                    <FaPlay className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Resume Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Continue processing prompts from where you left off. The queue will resume with the next pending prompt.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {queueState.isRunning && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="destructive" onClick={handleStopClick} size="sm" className="min-w-[80px]">
                    <FaStop className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Stop Queue</h4>
                    <p className="text-xs text-muted-foreground">
                      Stop the queue completely. The current prompt will finish, but the queue will not process any more prompts.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Timer will reset when stopped.</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        </div>
      </CardHeader>

      {queueState.isRunning && totalCount > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
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
