import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { FaInbox, FaMagic, FaUpload, FaPlus } from "react-icons/fa";
import { log } from "../utils/logger";

interface EmptyStateProps {
  onGenerate: () => void;
  onImport: () => void;
  onManual: () => void;
}

export function EmptyState({
  onGenerate,
  onImport,
  onManual,
}: EmptyStateProps) {
  const handleGenerate = () => {
    log.ui.action("EmptyState:Generate");
    onGenerate();
  };

  const handleImport = () => {
    log.ui.action("EmptyState:Import");
    onImport();
  };

  const handleManual = () => {
    log.ui.action("EmptyState:Manual");
    onManual();
  };

  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
          <FaInbox className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">No prompts yet</h3>
        <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm">
          Get started by generating AI prompts, adding them manually, or
          importing from a CSV file
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button onClick={handleGenerate} size="lg" className="shadow-md">
            <FaMagic className="mr-2 h-4 w-4" />
            Generate Prompts
          </Button>
          <Button variant="outline" onClick={handleManual} size="lg">
            <FaPlus className="mr-2 h-4 w-4" />
            Manual Add
          </Button>
          <Button variant="outline" onClick={handleImport} size="lg">
            <FaUpload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
        <div className="mt-8 pt-6 border-t w-full">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              ⌘K
            </kbd>{" "}
            to search or{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              ⌘N
            </kbd>{" "}
            to generate new prompts
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
