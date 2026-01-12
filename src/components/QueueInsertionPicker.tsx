import * as React from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { GeneratedPrompt, QueueInsertOptions, QueueState } from "../types";

interface QueueInsertionPickerProps {
  prompts: GeneratedPrompt[];
  queueState: QueueState | null;
  onOptionsChange: (options: QueueInsertOptions) => void;
}

export function QueueInsertionPicker({
  prompts,
  queueState,
  onOptionsChange,
}: QueueInsertionPickerProps) {
  const [position, setPosition] = React.useState<
    "end" | "after" | "before" | "start"
  >("end");
  const [referenceId, setReferenceId] = React.useState<string>("");

  React.useEffect(() => {
    onOptionsChange({
      position,
      referenceId:
        position === "after" || position === "before" ? referenceId : undefined,
    });
  }, [position, referenceId, onOptionsChange]);

  const pendingPrompts = prompts.filter((p) => p.status === "pending");
  const currentIndex = queueState?.currentPromptId
    ? prompts.findIndex((p) => p.id === queueState.currentPromptId)
    : -1;

  const isQueueRunning = queueState?.isRunning && !queueState?.isPaused;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <Label className="text-sm font-semibold">Insert Position</Label>

      <RadioGroup
        value={position}
        onValueChange={(v) => setPosition(v as typeof position)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="end" id="position-end" />
          <Label htmlFor="position-end" className="font-normal cursor-pointer">
            Add to end of queue (default)
            {isQueueRunning && (
              <span className="ml-2 text-xs text-muted-foreground">
                Will process after all pending prompts
              </span>
            )}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="start" id="position-start" />
          <Label
            htmlFor="position-start"
            className="font-normal cursor-pointer"
          >
            Add to beginning of queue
            {isQueueRunning && (
              <span className="ml-2 text-xs text-muted-foreground">
                Will process after current prompt completes
              </span>
            )}
          </Label>
        </div>

        {pendingPrompts.length > 0 && (
          <>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="after" id="position-after" />
              <Label
                htmlFor="position-after"
                className="font-normal cursor-pointer"
              >
                Insert after specific prompt
              </Label>
            </div>

            {position === "after" && (
              <Select value={referenceId} onValueChange={setReferenceId}>
                <SelectTrigger className="ml-6 mt-2">
                  <SelectValue placeholder="Select a prompt..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingPrompts.map((prompt) => {
                    const globalIndex = prompts.findIndex(
                      (p) => p.id === prompt.id,
                    );
                    const isAfterCurrent = globalIndex > currentIndex;

                    return (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            #{globalIndex + 1}
                          </span>
                          <span className="truncate max-w-[300px]">
                            {prompt.text.substring(0, 60)}
                            {prompt.text.length > 60 ? "..." : ""}
                          </span>
                          {!isAfterCurrent && isQueueRunning && (
                            <span className="text-xs text-yellow-500">
                              Before current
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="before" id="position-before" />
              <Label
                htmlFor="position-before"
                className="font-normal cursor-pointer"
              >
                Insert before specific prompt
              </Label>
            </div>

            {position === "before" && (
              <Select value={referenceId} onValueChange={setReferenceId}>
                <SelectTrigger className="ml-6 mt-2">
                  <SelectValue placeholder="Select a prompt..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingPrompts.map((prompt) => {
                    const globalIndex = prompts.findIndex(
                      (p) => p.id === prompt.id,
                    );
                    const isAfterCurrent = globalIndex > currentIndex;

                    return (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            #{globalIndex + 1}
                          </span>
                          <span className="truncate max-w-[300px]">
                            {prompt.text.substring(0, 60)}
                            {prompt.text.length > 60 ? "..." : ""}
                          </span>
                          {!isAfterCurrent && isQueueRunning && (
                            <span className="text-xs text-yellow-500">
                              Before current
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </>
        )}
      </RadioGroup>

      {isQueueRunning && (
        <div className="flex items-center gap-2 rounded-md bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
          <span className="animate-pulse">●</span>
          Queue is currently running - new prompts will be queued accordingly
        </div>
      )}
    </div>
  );
}
