import { Badge } from '@/components/ui/badge';
import { Clock, Play, Check } from 'lucide-react';

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

export function StatusBar({ pendingCount, processingCount, completedCount }: StatusBarProps) {
  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <Badge variant="secondary" className="bg-yellow-100/80 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
        <Clock className="h-3 w-3 mr-1.5" />
        {pendingCount} Pending
      </Badge>

      <Badge variant="default" className="bg-blue-100/80 text-blue-800 border-blue-200 hover:bg-blue-100">
        <Play className="h-3 w-3 mr-1.5" />
        {processingCount} Processing
      </Badge>

      <Badge variant="default" className="bg-green-100/80 text-green-800 border-green-200 hover:bg-green-100">
        <Check className="h-3 w-3 mr-1.5" />
        ✓ {completedCount} Completed
      </Badge>
    </div>
  );
}
