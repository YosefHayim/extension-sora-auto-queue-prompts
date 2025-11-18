import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pencil, Copy, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          <Badge variant="outline" className="text-xs">
            {prompt.mediaType}
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
        <Badge className={cn('text-xs', getStatusColor(prompt.status))}>
          {prompt.status}
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

      <CardFooter className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(prompt.id)}
          title="Edit prompt"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDuplicate(prompt.id)}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRefine(prompt.id)}
          title="Refine with AI"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onGenerateSimilar(prompt.id)}>
              Generate Similar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(prompt.id)}
              className="text-destructive"
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
