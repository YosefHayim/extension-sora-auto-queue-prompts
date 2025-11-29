import * as React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pencil, CopyPlus, Sparkles, MoreVertical, Trash2, Image, Video, CheckCircle2, Timer, Clock, XCircle, Play, CheckSquare, Square, ClipboardCopy, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { log } from '@/utils/logger';
import type { GeneratedPrompt } from '@/types';

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return `${ms || 0}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  return 'Just now';
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PromptCardProps {
  prompt: GeneratedPrompt;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  onProcess?: (id: string) => void;
  onNavigateToPrompt?: (id: string, text: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
}

const MAX_TEXT_LENGTH = 200;

export function PromptCard({
  prompt,
  isSelected = false,
  onToggleSelection,
  onProcess,
  onNavigateToPrompt,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onDelete,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const shouldTruncate = prompt.text.length > MAX_TEXT_LENGTH;
  const displayText = isExpanded || !shouldTruncate ? prompt.text : prompt.text.substring(0, MAX_TEXT_LENGTH) + '...';

  const handleEdit = () => {
    log.ui.action('PromptCard:Edit', { promptId: prompt.id, status: prompt.status });
    onEdit(prompt.id);
  };

  const handleDuplicate = () => {
    log.ui.action('PromptCard:Duplicate', { promptId: prompt.id, mediaType: prompt.mediaType });
    onDuplicate(prompt.id);
  };

  const handleRefine = () => {
    log.ui.action('PromptCard:Refine', { promptId: prompt.id, enhanced: prompt.enhanced });
    onRefine(prompt.id);
  };

  const handleGenerateSimilar = () => {
    log.ui.action('PromptCard:GenerateSimilar', { promptId: prompt.id });
    onGenerateSimilar(prompt.id);
  };

  const handleDelete = () => {
    log.ui.action('PromptCard:Delete', { promptId: prompt.id, status: prompt.status });
    onDelete(prompt.id);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      log.ui.action('PromptCard:CopyText', { promptId: prompt.id });
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'processing':
        return <Timer className="h-3.5 w-3.5" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />;
      case 'failed':
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500 dark:border-l-green-400';
      case 'processing':
        return 'border-l-yellow-500 dark:border-l-yellow-400';
      case 'pending':
        return 'border-l-gray-400 dark:border-l-gray-500';
      case 'failed':
        return 'border-l-red-500 dark:border-l-red-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection?.(prompt.id);
  };

  const handleProcess = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProcess?.(prompt.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-no-drag]') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }

    // Only navigate for completed prompts
    if (prompt.status === 'completed' && onNavigateToPrompt) {
      onNavigateToPrompt(prompt.id, prompt.text);
    }
  };

  const isCompleted = prompt.status === 'completed';
  const isProcessing = prompt.status === 'processing';
  const canEdit = !isCompleted && !isProcessing;
  const canRefine = !isCompleted && !isProcessing;

  // Estimate completion time for processing prompts (average 2-3 minutes)
  const estimatedCompletion = isProcessing && prompt.startTime
    ? prompt.startTime + (2.5 * 60 * 1000) // 2.5 minutes average
    : null;
  const estimatedTimeRemaining = estimatedCompletion
    ? Math.max(0, estimatedCompletion - Date.now())
    : null;

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'group transition-all duration-300 hover:shadow-xl hover:border-primary/50 relative overflow-hidden',
        'border-l-4',
        getStatusBorderColor(prompt.status),
        isProcessing && 'ring-2 ring-yellow-500/20 dark:ring-yellow-400/20',
        isSelected && 'border-2 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 dark:ring-blue-400/20 bg-blue-50/50 dark:bg-blue-950/30',
        prompt.status === 'failed' && 'bg-destructive/5 dark:bg-destructive/10',
        isCompleted && onNavigateToPrompt && 'cursor-pointer hover:ring-2 hover:ring-green-500/30'
      )}
      title={isCompleted && onNavigateToPrompt ? 'Click to navigate to this prompt on Sora' : undefined}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 px-4 pt-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onToggleSelection && (
            <button
              onClick={handleToggleSelection}
              className="flex-shrink-0 p-1 rounded hover:bg-accent transition-colors"
              title={isSelected ? "Deselect" : "Select"}
              data-no-drag
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          <div className="flex gap-2 flex-wrap flex-1 min-w-0">
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 text-xs font-medium",
                prompt.mediaType === 'video' && "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
                prompt.mediaType === 'image' && "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
              )}
            >
              {prompt.mediaType === 'video' ? (
                <Video className="h-3 w-3" />
              ) : (
                <Image className="h-3 w-3" />
              )}
              {prompt.mediaType.charAt(0).toUpperCase() + prompt.mediaType.slice(1)}
            </Badge>
            {prompt.aspectRatio && (
              <Badge variant="secondary" className="text-xs font-medium">
                {prompt.aspectRatio}
              </Badge>
            )}
            {prompt.variations && (
              <Badge variant="outline" className="text-xs font-medium gap-1">
                <FileText className="h-3 w-3" />
                {prompt.variations} variation{prompt.variations !== 1 ? 's' : ''}
              </Badge>
            )}
            {prompt.enhanced && (
              <Badge variant="default" className="gap-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="h-3 w-3" />
                Enhanced
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onProcess && prompt.status === 'pending' && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleProcess}
                  className="h-7 text-xs gap-1.5"
                  title="Process this prompt"
                  data-no-drag
                >
                  <Play className="h-3.5 w-3.5" />
                  Process
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Process Prompt</h4>
                  <p className="text-xs text-muted-foreground">
                    Start processing this prompt immediately. It will be submitted to Sora for generation.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge 
                variant="outline"
                className={cn(
                  "flex items-center justify-center gap-1.5 px-2.5 py-1.5 border font-semibold text-xs",
                  isProcessing && "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300",
                  isCompleted && "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300",
                  prompt.status === 'pending' && "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                  prompt.status === 'failed' && "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                )}
              >
                {getStatusIcon(prompt.status)}
                <span className="capitalize">{prompt.status}</span>
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold capitalize">{prompt.status} Status</h4>
                <p className="text-xs text-muted-foreground">
                  {isCompleted && prompt.completedTime && `Completed ${formatTimeAgo(prompt.completedTime)}`}
                  {isProcessing && 'Currently being processed by Sora'}
                  {prompt.status === 'pending' && 'Waiting to be processed'}
                  {prompt.status === 'failed' && 'Failed during processing'}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        <div className="space-y-3">
          <div>
            <p className="text-sm leading-relaxed text-foreground font-medium">
              {displayText}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 text-xs mt-2 px-2"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Read more
                  </>
                )}
              </Button>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {prompt.text.length} characters
              </span>
            </div>
          </div>

          {/* Progress indicator for processing prompts */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Processing...</span>
                {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                  <span className="text-muted-foreground">
                    ~{formatDuration(estimatedTimeRemaining)} remaining
                  </span>
                )}
              </div>
              <Progress value={prompt.startTime ? Math.min(90, ((Date.now() - prompt.startTime) / (2.5 * 60 * 1000)) * 100) : 0} className="h-1.5" />
            </div>
          )}

          {/* Duration and timing info */}
          <div className="flex items-center gap-3 flex-wrap">
            {isCompleted && prompt.duration && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge variant="outline" className="text-xs gap-1.5 cursor-help">
                    <Timer className="h-3 w-3" />
                    {formatDuration(prompt.duration)}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Generation Duration</h4>
                    <p className="text-xs text-muted-foreground">
                      Time taken to generate this {prompt.mediaType}
                    </p>
                    {prompt.completedTime && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed: {formatDateTime(prompt.completedTime)}
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
            {isProcessing && prompt.startTime && (
              <Badge variant="outline" className="text-xs gap-1.5">
                <Timer className="h-3 w-3 animate-pulse" />
                {formatDuration(Date.now() - prompt.startTime)}
              </Badge>
            )}
            {prompt.timestamp && (
              <span className="text-xs text-muted-foreground">
                Created {formatTimeAgo(prompt.timestamp)}
              </span>
            )}
          </div>

          {/* Collapsible metadata */}
          <Collapsible open={isMetadataOpen} onOpenChange={setIsMetadataOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                {isMetadataOpen ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{formatDateTime(prompt.timestamp)}</span>
                </div>
                {prompt.completedTime && (
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="ml-2">{formatDateTime(prompt.completedTime)}</span>
                  </div>
                )}
                {prompt.startTime && (
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <span className="ml-2">{formatDateTime(prompt.startTime)}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="ml-2 font-mono text-[10px]">{prompt.id.substring(0, 8)}...</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>

      <CardFooter className="gap-1 pt-3 border-t px-4" data-no-drag>
        <div className="flex items-center gap-1 flex-1">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyText}
                title="Copy prompt text"
                type="button"
                data-no-drag
                className="h-8 w-8"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Copy Text</h4>
                <p className="text-xs text-muted-foreground">
                  {copied ? 'Copied to clipboard!' : 'Copy the prompt text to your clipboard'}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                disabled={!canEdit}
                title="Edit prompt (E)"
                type="button"
                data-no-drag
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Edit Prompt</h4>
                <p className="text-xs text-muted-foreground">
                  {canEdit ? 'Modify the prompt text. Changes will be saved immediately.' : 'Cannot edit completed or processing prompts'}
                </p>
                {canEdit && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">E</kbd> Keyboard shortcut
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuplicate}
                title="Duplicate (D)"
                type="button"
                data-no-drag
                className="h-8 w-8"
              >
                <CopyPlus className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Duplicate Prompt</h4>
                <p className="text-xs text-muted-foreground">
                  Create an exact copy of this prompt in the queue.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">D</kbd> Keyboard shortcut
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefine}
                disabled={!canRefine}
                title="Refine with AI (R)"
                type="button"
                data-no-drag
                className="h-8 w-8"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Refine with AI</h4>
                <p className="text-xs text-muted-foreground">
                  {canRefine ? 'Enhance this prompt using AI to improve clarity and effectiveness.' : 'Cannot refine completed or processing prompts'}
                </p>
                {canRefine && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">R</kbd> Keyboard shortcut
                  </p>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button" data-no-drag className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleGenerateSimilar}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Similar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
