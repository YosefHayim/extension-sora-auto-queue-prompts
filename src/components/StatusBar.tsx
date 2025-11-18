import { Badge } from '@/components/ui/badge';
import { Clock, Play, Check } from 'lucide-react';

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

export function StatusBar({ pendingCount, processingCount, completedCount }: StatusBarProps) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        {pendingCount} Pending
      </Badge>

      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Play className="h-3 w-3 mr-1" />
        {processingCount} Processing
      </Badge>

      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Check className="h-3 w-3 mr-1" />
        {completedCount} Completed
      </Badge>
    </div>
  );
}
