import { CSS } from "@dnd-kit/utilities";
import type { GeneratedPrompt } from "@/types";
import { PromptCard } from "./PromptCard";
import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";

interface SortablePromptCardProps {
  prompt: GeneratedPrompt;
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
  const filteredListeners = useMemo(() => {
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
      <PromptCard {...props} />
    </div>
  );
}
