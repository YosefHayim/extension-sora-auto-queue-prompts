import { FaClock, FaPlay, FaCheck } from 'react-icons/fa';

interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

export function StatusBar({ pendingCount, processingCount, completedCount }: StatusBarProps) {
  const total = pendingCount + processingCount + completedCount;

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1.5">
      <div className="flex items-center gap-1.5">
        <FaClock className="h-3 w-3 text-yellow-600 dark:text-yellow-500" />
        <span className="font-medium text-foreground">{pendingCount}</span>
        <span className="hidden sm:inline">Pending</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <FaPlay className="h-3 w-3 text-blue-600 dark:text-blue-500" />
        <span className="font-medium text-foreground">{processingCount}</span>
        <span className="hidden sm:inline">Processing</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <FaCheck className="h-3 w-3 text-green-600 dark:text-green-500" />
        <span className="font-medium text-foreground">{completedCount}</span>
        <span className="hidden sm:inline">Completed</span>
      </div>
      
      <div className="ml-auto text-xs opacity-70">
        {total} total
      </div>
    </div>
  );
}
