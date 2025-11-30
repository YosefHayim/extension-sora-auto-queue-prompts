import { Badge } from './ui/badge';
import { FaClock, FaPlay, FaCheck } from 'react-icons/fa';

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

export function StatusBar({ pendingCount, processingCount, completedCount }: StatusBarProps) {
  const total = pendingCount + processingCount + completedCount;

  return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
      <Badge 
        variant="secondary" 
        className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 font-medium"
      >
        <FaClock className="h-3 w-3 mr-1.5" />
        {pendingCount} Pending
      </Badge>

      <Badge 
        variant="default" 
        className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 font-medium"
      >
        <FaPlay className="h-3 w-3 mr-1.5" />
        {processingCount} Processing
      </Badge>

      <Badge 
        variant="default" 
        className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 font-medium"
      >
        <FaCheck className="h-3 w-3 mr-1.5" />
        {completedCount} Completed
      </Badge>

      {total > 0 && (
        <Badge variant="outline" className="ml-auto font-medium">
          {total} Total
        </Badge>
      )}
    </div>
  );
}
