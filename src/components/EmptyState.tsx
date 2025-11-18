import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, Sparkles, Upload, ListPlus } from 'lucide-react';
import { log } from '@/utils/logger';

interface EmptyStateProps {
  onGenerate: () => void;
  onImport: () => void;
  onManual: () => void;
}

export function EmptyState({ onGenerate, onImport, onManual }: EmptyStateProps) {
  const handleGenerate = () => {
    log.ui.action('EmptyState:Generate');
    onGenerate();
  };

  const handleImport = () => {
    log.ui.action('EmptyState:Import');
    onImport();
  };

  const handleManual = () => {
    log.ui.action('EmptyState:Manual');
    onManual();
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
          Generate AI prompts, add manually, or import from CSV to get started
        </p>
        <div className="flex gap-3">
          <Button onClick={handleGenerate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <Button variant="outline" onClick={handleManual}>
            <ListPlus className="mr-2 h-4 w-4" />
            Manual Add
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
