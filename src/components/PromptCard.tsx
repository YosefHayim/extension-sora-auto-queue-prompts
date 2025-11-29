import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil, Copy, Sparkles, MoreVertical, Trash2, Image, Video, CheckCircle2, Timer, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { log } from '@/utils/logger';
import type { GeneratedPrompt } from '@/types';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({
  prompt,
  onEdit,
  onDuplicate,
  onRefine,
  onGenerateSimilar,
  onDelete,
}: PromptCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'processing':
        return <Timer className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-500 text-white border-green-600 dark:bg-green-600 dark:border-green-700";
      case 'processing':
        return "bg-yellow-500 text-white border-yellow-600 dark:bg-yellow-600 dark:border-yellow-700 animate-pulse";
      case 'pending':
        return "bg-gray-400 text-white border-gray-500 dark:bg-gray-600 dark:border-gray-700";
      case 'failed':
        return "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-700";
      default:
        return "bg-gray-400 text-white border-gray-500";
    }
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-lg hover:border-primary/50',
        prompt.status === 'processing' && 'border-primary ring-2 ring-primary/20',
        prompt.status === 'completed' && 'opacity-75',
        prompt.status === 'failed' && 'border-destructive/50 bg-destructive/5'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex gap-2 flex-wrap">
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
          {prompt.enhanced && (
            <Badge variant="default" className="gap-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </Badge>
          )}
        </div>
        <Badge 
          variant="outline"
          className={cn(
            "flex items-center justify-center gap-1.5 px-2 py-1.5 border-2 font-semibold",
            getStatusStyles(prompt.status)
          )}
          title={prompt.status.charAt(0).toUpperCase() + prompt.status.slice(1)}
        >
          {getStatusIcon(prompt.status)}
        </Badge>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm leading-relaxed text-foreground font-medium">{prompt.text}</p>
        {prompt.variations && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">
              {prompt.variations} variation{prompt.variations !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-1 pt-3 border-t" data-no-drag>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          title="Edit prompt (E)"
          type="button"
          data-no-drag
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDuplicate}
          title="Duplicate (D)"
          type="button"
          data-no-drag
          className="h-8 w-8"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefine}
          title="Refine with AI (R)"
          type="button"
          data-no-drag
          className="h-8 w-8"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

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
