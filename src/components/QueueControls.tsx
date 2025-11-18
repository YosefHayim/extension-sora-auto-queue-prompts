import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              variant={queueState.isRunning ? 'default' : 'secondary'}
              className="text-sm"
            >
              {queueState.isRunning
                ? queueState.isPaused
                  ? '⏸ Paused'
                  : '▶ Running'
                : '⏹ Stopped'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {queueState.processedCount} / {totalCount} prompts
            </span>
          </div>

          <div className="flex gap-2">
            {!queueState.isRunning && (
              <Button onClick={handleStartClick} className="w-32">
                <Play className="h-4 w-4 mr-2" />
                Start Queue
              </Button>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <Button variant="secondary" onClick={handlePauseClick}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <Button onClick={handleResumeClick}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {queueState.isRunning && (
              <Button variant="destructive" onClick={handleStopClick}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {queueState.isRunning && (
        <CardContent>
          <Progress value={progress} className="w-full" />
        </CardContent>
      )}
    </Card>
  );
}
