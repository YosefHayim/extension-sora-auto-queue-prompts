import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square } from 'lucide-react';
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
              <Button onClick={onStart} className="w-32">
                <Play className="h-4 w-4 mr-2" />
                Start Queue
              </Button>
            )}
            {queueState.isRunning && !queueState.isPaused && (
              <Button variant="secondary" onClick={onPause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {queueState.isRunning && queueState.isPaused && (
              <Button onClick={onResume}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {queueState.isRunning && (
              <Button variant="destructive" onClick={onStop}>
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
