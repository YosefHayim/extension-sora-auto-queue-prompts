import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil, Copy, Sparkles, MoreVertical, Trash2, Image, Video } from 'lucide-react';
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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md',
        prompt.status === 'processing' && 'border-primary animate-pulse',
        prompt.status === 'completed' && 'opacity-70'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1 text-xs">
            {prompt.mediaType === 'video' ? (
              <Video className="h-3 w-3" />
            ) : (
              <Image className="h-3 w-3" />
            )}
            {capitalizeFirst(prompt.mediaType)}
          </Badge>
          {prompt.aspectRatio && (
            <Badge variant="secondary" className="text-xs">
              {prompt.aspectRatio}
            </Badge>
          )}
          {prompt.enhanced && (
            <Badge variant="default" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </Badge>
          )}
        </div>
        <Badge variant={getStatusVariant(prompt.status)} className="text-xs">
          {capitalizeFirst(prompt.status)}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">{prompt.text}</p>
        {prompt.variations && (
          <span className="text-xs text-muted-foreground mt-2 block">
            {prompt.variations} variations
          </span>
        )}
      </CardContent>

      <CardFooter className="gap-2" data-no-drag>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          title="Edit prompt"
          type="button"
          data-no-drag
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDuplicate}
          title="Duplicate"
          type="button"
          data-no-drag
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefine}
          title="Refine with AI"
          type="button"
          data-no-drag
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" type="button" data-no-drag>
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
