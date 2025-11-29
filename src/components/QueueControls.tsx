import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { log } from '@/utils/logger';
import type { QueueState } from '@/types';

interface QueueControlsProps {
  queueState: QueueState;
  totalCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function QueueControls({
  queueState,
  totalCount,
  onStart,
  onPause,
  onResume,
  onStop,
}: QueueControlsProps) {
  const progress = totalCount > 0 ? (queueState.processedCount / totalCount) * 100 : 0;

  const handleStartClick = () => {
    log.ui.action('QueueControls:Start', { totalCount });
    onStart();
  };

  const handlePauseClick = () => {
    log.ui.action('QueueControls:Pause', { processedCount: queueState.processedCount, totalCount });
    onPause();
  };

  const handleResumeClick = () => {
    log.ui.action('QueueControls:Resume', { processedCount: queueState.processedCount, totalCount });
    onResume();
  };

  const handleStopClick = () => {
    log.ui.action('QueueControls:Stop', { processedCount: queueState.processedCount, totalCount });
    onStop();
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              variant={queueState.isRunning ? 'default' : 'secondary'}
              className={cn(
                "text-sm font-semibold px-3 py-1",
                queueState.isRunning && !queueState.isPaused && "bg-green-500 text-white animate-pulse",
                queueState.isRunning && queueState.isPaused && "bg-yellow-500 text-white",
                !queueState.isRunning && "bg-gray-500 text-white"
              )}
            >
              {queueState.isRunning
                ? queueState.isPaused
                  ? '⏸ Paused'
                  : '▶ Running'
                : '⏹ Stopped'}
            </Badge>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {queueState.processedCount} / {totalCount} prompts
              </span>
              {totalCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}% complete
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!queueState.isRunning && (
              <Button onClick={handleStartClick} size="sm" className="w-28">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <Button variant="secondary" onClick={handlePauseClick} size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <Button onClick={handleResumeClick} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {queueState.isRunning && (
              <Button variant="destructive" onClick={handleStopClick} size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
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
