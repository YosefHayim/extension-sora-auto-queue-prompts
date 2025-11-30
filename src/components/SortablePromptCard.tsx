import * as React from "react";

import { CSS } from "@dnd-kit/utilities";
import type { GeneratedPrompt } from "../types"
import { PromptCard } from "./PromptCard";
import { useSortable } from "@dnd-kit/sortable";

interface SortablePromptCardProps {
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

export function SortablePromptCard(props: SortablePromptCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Filter out drag events from interactive elements
  // The PointerSensor with activationConstraint should handle most cases,
  // but we add an extra check here for safety
  const filteredListeners = React.useMemo(() => {
    if (!listeners?.onPointerDown) return listeners;

    const originalHandler = listeners.onPointerDown;
    return {
      ...listeners,
      onPointerDown: (event: PointerEvent) => {
        const target = event.target as HTMLElement;
        // Don't start drag if clicking on interactive elements
        if (target.closest("button") || target.closest("input") || target.closest('[role="button"]') || target.closest("[data-no-drag]")) {
          event.stopPropagation();
          return;
        }
        originalHandler(event);
      },
    };
  }, [listeners]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...filteredListeners} className="relative">
      <PromptCard
        prompt={props.prompt}
        isSelected={props.isSelected}
        onToggleSelection={props.onToggleSelection}
        onProcess={props.onProcess}
        onNavigateToPrompt={props.onNavigateToPrompt}
        onEdit={props.onEdit}
        onDuplicate={props.onDuplicate}
        onRefine={props.onRefine}
        onGenerateSimilar={props.onGenerateSimilar}
        onDelete={props.onDelete}
      />
    </div>
  );
}
