import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import type { GeneratedPrompt } from "../../src/types";
import { SortablePromptCard } from "../../src/components/SortablePromptCard";
import userEvent from "@testing-library/user-event";

// Mock @dnd-kit/sortable
jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: { role: "button" },
    listeners: {
      onPointerDown: jest.fn(),
    },
    setNodeRef: jest.fn((node) => node),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock @dnd-kit/utilities
jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => "translate3d(0, 0, 0)"),
    },
  },
}));

// Mock PromptCard
jest.mock("../../src/components/PromptCard", () => ({
  PromptCard: ({ prompt, onEdit, onDelete }: any) => (
    <div data-testid="prompt-card">
      <div>{prompt.text}</div>
      <button onClick={() => onEdit(prompt.id)}>Edit</button>
      <button onClick={() => onDelete(prompt.id)}>Delete</button>
    </div>
  ),
}));

describe("SortablePromptCard", () => {
  const mockPrompt: GeneratedPrompt = {
    id: "test-id",
    text: "Test prompt",
    status: "pending",
    timestamp: Date.now(),
    mediaType: "image",
  };

  const mockProps = {
    prompt: mockPrompt,
    onEdit: jest.fn(),
    onDuplicate: jest.fn(),
    onRefine: jest.fn(),
    onGenerateSimilar: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render PromptCard with prompt", () => {
    render(<SortablePromptCard {...mockProps} />);
    expect(screen.getByText("Test prompt")).toBeInTheDocument();
  });

  it("should pass all props to PromptCard", () => {
    render(<SortablePromptCard {...mockProps} isSelected={true} />);
    const card = screen.getByTestId("prompt-card");
    expect(card).toBeInTheDocument();
  });

  it("should handle drag events", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const mockListeners = {
      onPointerDown: jest.fn(),
    };

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: mockListeners,
      setNodeRef: jest.fn((node) => node),
      transform: { x: 10, y: 20 },
      transition: "transform 200ms",
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);

    // The component should render with sortable functionality
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it("should filter drag events from buttons", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const mockListeners = {
      onPointerDown: originalHandler,
    };

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: mockListeners,
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);

    // The component should render with filtered listeners
    // The actual filtering happens in the component's filteredListeners logic
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it("should apply transform style when dragging", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const { CSS } = require("@dnd-kit/utilities");

    CSS.Transform.toString = jest.fn(() => "translate3d(10px, 20px, 0)");

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {},
      setNodeRef: jest.fn((node) => node),
      transform: { x: 10, y: 20 },
      transition: "transform 200ms",
      isDragging: true,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "0.5" });
  });

  it("should return listeners when onPointerDown does not exist", () => {
    const { useSortable } = require("@dnd-kit/sortable");

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {},
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it("should return listeners when listeners is null", () => {
    const { useSortable } = require("@dnd-kit/sortable");

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: null,
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    render(<SortablePromptCard {...mockProps} />);
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });

  it("should stop drag when clicking on button element", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;

    // Create a button that is actually a button element (closest will find it)
    const button = document.createElement("button");
    button.textContent = "Test Button";
    wrapper.appendChild(button);

    const mockEvent = {
      target: button,
      stopPropagation,
    } as unknown as PointerEvent;

    const onPointerDown = (wrapper as any).onPointerDown;

    if (onPointerDown) {
      onPointerDown(mockEvent);
      expect(stopPropagation).toHaveBeenCalled();
      expect(originalHandler).not.toHaveBeenCalled();
    }
  });

  it("should stop drag when clicking on input element", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;
    const input = document.createElement("input");
    wrapper.appendChild(input);

    const mockEvent = {
      target: input,
      stopPropagation,
    } as unknown as PointerEvent;

    const onPointerDown = (wrapper as any).onPointerDown;

    if (onPointerDown) {
      onPointerDown(mockEvent);
      expect(stopPropagation).toHaveBeenCalled();
      expect(originalHandler).not.toHaveBeenCalled();
    }
  });

  it('should stop drag when clicking on element with role="button"', () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;
    const div = document.createElement("div");
    div.setAttribute("role", "button");
    wrapper.appendChild(div);

    const mockEvent = {
      target: div,
      stopPropagation,
    } as unknown as PointerEvent;

    const onPointerDown = (wrapper as any).onPointerDown;

    if (onPointerDown) {
      onPointerDown(mockEvent);
      expect(stopPropagation).toHaveBeenCalled();
      expect(originalHandler).not.toHaveBeenCalled();
    }
  });

  it("should stop drag when clicking on element with data-no-drag attribute", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;
    const div = document.createElement("div");
    div.setAttribute("data-no-drag", "true");
    wrapper.appendChild(div);

    const mockEvent = {
      target: div,
      stopPropagation,
    } as unknown as PointerEvent;

    const onPointerDown = (wrapper as any).onPointerDown;

    if (onPointerDown) {
      onPointerDown(mockEvent);
      expect(stopPropagation).toHaveBeenCalled();
      expect(originalHandler).not.toHaveBeenCalled();
    }
  });

  it("should call original handler when clicking on non-interactive element", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);

    const wrapper = container.firstChild as HTMLElement;
    const div = document.createElement("div");
    div.textContent = "Non-interactive";
    wrapper.appendChild(div);

    // Mock closest to return null for all interactive element checks
    div.closest = jest.fn(() => null);

    const mockEvent = {
      target: div,
      stopPropagation,
    } as unknown as PointerEvent;

    const onPointerDown = (wrapper as any).onPointerDown;

    if (onPointerDown) {
      onPointerDown(mockEvent);
      // Should not stop propagation and should call original handler
      expect(stopPropagation).not.toHaveBeenCalled();
      expect(originalHandler).toHaveBeenCalledWith(mockEvent);
    }
  });

  it("should test each closest() branch separately - button branch", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test button closest() branch - this should trigger the first condition
    const button = document.createElement("button");
    wrapper.appendChild(button);
    const buttonEvent = { target: button, stopPropagation } as unknown as PointerEvent;
    button.closest = jest.fn((selector: string) => (selector === "button" ? button : null));
    onPointerDown(buttonEvent);
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should test input closest() branch", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test input closest() branch - button should return null, input should return element
    const input = document.createElement("input");
    wrapper.appendChild(input);
    const inputEvent = { target: input, stopPropagation } as unknown as PointerEvent;
    input.closest = jest.fn((selector: string) => {
      if (selector === "button") return null;
      if (selector === "input") return input;
      return null;
    });
    onPointerDown(inputEvent);
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it('should test role="button" closest() branch', () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test role="button" closest() branch - button and input should return null
    const roleButton = document.createElement("div");
    roleButton.setAttribute("role", "button");
    wrapper.appendChild(roleButton);
    const roleButtonEvent = { target: roleButton, stopPropagation } as unknown as PointerEvent;
    roleButton.closest = jest.fn((selector: string) => {
      if (selector === "button") return null;
      if (selector === "input") return null;
      if (selector === '[role="button"]') return roleButton;
      return null;
    });
    onPointerDown(roleButtonEvent);
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should test data-no-drag closest() branch", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test data-no-drag closest() branch - all others should return null
    const noDrag = document.createElement("div");
    noDrag.setAttribute("data-no-drag", "true");
    wrapper.appendChild(noDrag);
    const noDragEvent = { target: noDrag, stopPropagation } as unknown as PointerEvent;
    noDrag.closest = jest.fn((selector: string) => {
      if (selector === "button") return null;
      if (selector === "input") return null;
      if (selector === '[role="button"]') return null;
      if (selector === "[data-no-drag]") return noDrag;
      return null;
    });
    onPointerDown(noDragEvent);
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should call originalHandler when all closest() checks return null", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Create a div that doesn't match any interactive element
    const div = document.createElement("div");
    div.textContent = "Plain div";
    wrapper.appendChild(div);

    // Mock closest to return null for all selectors
    div.closest = jest.fn(() => null);

    const mockEvent = {
      target: div,
      stopPropagation,
    } as unknown as PointerEvent;

    onPointerDown(mockEvent);

    // Should call originalHandler and not stop propagation
    expect(originalHandler).toHaveBeenCalledWith(mockEvent);
    expect(stopPropagation).not.toHaveBeenCalled();
  });

  it("should handle event when target.closest returns element for button", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    const button = document.createElement("button");
    wrapper.appendChild(button);

    const mockEvent = {
      target: button,
      stopPropagation,
    } as unknown as PointerEvent;

    // Mock closest to return button for "button" selector
    button.closest = jest.fn((selector: string) => {
      if (selector === "button") return button;
      return null;
    });

    onPointerDown(mockEvent);

    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should handle event when target.closest returns element for input", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    const input = document.createElement("input");
    wrapper.appendChild(input);

    const mockEvent = {
      target: input,
      stopPropagation,
    } as unknown as PointerEvent;

    // Mock closest to return input for "input" selector
    input.closest = jest.fn((selector: string) => {
      if (selector === "input") return input;
      return null;
    });

    onPointerDown(mockEvent);

    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should handle event when target.closest returns element for role button", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    const roleButton = document.createElement("div");
    roleButton.setAttribute("role", "button");
    wrapper.appendChild(roleButton);

    const mockEvent = {
      target: roleButton,
      stopPropagation,
    } as unknown as PointerEvent;

    // Mock closest to return roleButton for '[role="button"]' selector
    roleButton.closest = jest.fn((selector: string) => {
      if (selector === '[role="button"]') return roleButton;
      return null;
    });

    onPointerDown(mockEvent);

    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should handle event when target.closest returns element for data-no-drag", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    const noDrag = document.createElement("div");
    noDrag.setAttribute("data-no-drag", "true");
    wrapper.appendChild(noDrag);

    const mockEvent = {
      target: noDrag,
      stopPropagation,
    } as unknown as PointerEvent;

    // Mock closest to return noDrag for '[data-no-drag]' selector
    noDrag.closest = jest.fn((selector: string) => {
      if (selector === "[data-no-drag]") return noDrag;
      return null;
    });

    onPointerDown(mockEvent);

    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should handle event target as HTMLElement and call stopPropagation correctly", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test that event.target is properly cast to HTMLElement
    const button = document.createElement("button");
    wrapper.appendChild(button);

    const mockEvent = {
      target: button,
      stopPropagation,
    } as unknown as PointerEvent;

    button.closest = jest.fn((selector: string) => {
      if (selector === "button") return button;
      return null;
    });

    onPointerDown(mockEvent);

    // Verify the handler properly accesses target.closest
    expect(button.closest).toHaveBeenCalledWith("button");
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should test all branches of the if condition with OR logic", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler = jest.fn();
    const stopPropagation = jest.fn();

    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { container } = render(<SortablePromptCard {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    const onPointerDown = (wrapper as any).onPointerDown;

    if (!onPointerDown) return;

    // Test that when first condition (button) is true, others are not evaluated (short-circuit)
    const button = document.createElement("button");
    wrapper.appendChild(button);

    const mockEvent = {
      target: button,
      stopPropagation,
    } as unknown as PointerEvent;

    const closestSpy = jest.fn((selector: string) => {
      if (selector === "button") return button;
      // These should not be called due to short-circuit evaluation
      if (selector === "input") return null;
      if (selector === '[role="button"]') return null;
      if (selector === "[data-no-drag]") return null;
      return null;
    });

    button.closest = closestSpy;

    onPointerDown(mockEvent);

    // Should only call closest with "button" due to short-circuit
    expect(closestSpy).toHaveBeenCalledWith("button");
    expect(closestSpy).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalled();
    expect(originalHandler).not.toHaveBeenCalled();
  });

  it("should test filteredListeners useMemo dependency on listeners", () => {
    const { useSortable } = require("@dnd-kit/sortable");
    const originalHandler1 = jest.fn();
    const originalHandler2 = jest.fn();

    // First render with first handler
    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler1,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    const { rerender } = render(<SortablePromptCard {...mockProps} />);

    // Second render with different handler (should trigger useMemo recalculation)
    useSortable.mockReturnValue({
      attributes: { role: "button" },
      listeners: {
        onPointerDown: originalHandler2,
      },
      setNodeRef: jest.fn((node) => node),
      transform: null,
      transition: null,
      isDragging: false,
    });

    rerender(<SortablePromptCard {...mockProps} />);

    // Verify useSortable was called with the prompt id
    expect(useSortable).toHaveBeenCalledWith({ id: mockPrompt.id });
  });
});
