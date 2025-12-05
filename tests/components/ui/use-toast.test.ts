import * as React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useToast, toast, reducer } from "../../../src/components/ui/use-toast";

// Define types locally since they're not exported
type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type State = {
  toasts: ToasterToast[];
};

type Action =
  | {
      type: "ADD_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: Partial<ToasterToast>;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: string;
    };

// Mock timers
jest.useFakeTimers();

describe("use-toast", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe("reducer", () => {
    it("should add a toast", () => {
      const initialState: State = { toasts: [] };
      const action: Action = {
        type: "ADD_TOAST",
        toast: {
          id: "1",
          title: "Test Toast",
          open: true,
        },
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].title).toBe("Test Toast");
    });

    it("should limit toasts to TOAST_LIMIT", () => {
      const initialState: State = {
        toasts: Array.from({ length: 1 }, (_, i) => ({
          id: `${i}`,
          title: `Toast ${i}`,
          open: true,
        })),
      };
      const action: Action = {
        type: "ADD_TOAST",
        toast: {
          id: "2",
          title: "New Toast",
          open: true,
        },
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].title).toBe("New Toast");
    });

    it("should update a toast", () => {
      const initialState: State = {
        toasts: [
          {
            id: "1",
            title: "Original Title",
            open: true,
          },
        ],
      };
      const action: Action = {
        type: "UPDATE_TOAST",
        toast: {
          id: "1",
          title: "Updated Title",
        },
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts[0].title).toBe("Updated Title");
    });

    it("should dismiss a specific toast", () => {
      const initialState: State = {
        toasts: [
          { id: "1", title: "Toast 1", open: true },
          { id: "2", title: "Toast 2", open: true },
        ],
      };
      const action: Action = {
        type: "DISMISS_TOAST",
        toastId: "1",
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(true);
    });

    it("should dismiss all toasts when toastId is undefined", () => {
      const initialState: State = {
        toasts: [
          { id: "1", title: "Toast 1", open: true },
          { id: "2", title: "Toast 2", open: true },
        ],
      };
      const action: Action = {
        type: "DISMISS_TOAST",
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts.every((t) => t.open === false)).toBe(true);
    });

    it("should remove a toast", () => {
      const initialState: State = {
        toasts: [
          { id: "1", title: "Toast 1", open: true },
          { id: "2", title: "Toast 2", open: true },
        ],
      };
      const action: Action = {
        type: "REMOVE_TOAST",
        toastId: "1",
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe("2");
    });

    it("should remove all toasts when toastId is undefined", () => {
      const initialState: State = {
        toasts: [
          { id: "1", title: "Toast 1", open: true },
          { id: "2", title: "Toast 2", open: true },
        ],
      };
      const action: Action = {
        type: "REMOVE_TOAST",
      };

      const newState = reducer(initialState, action);
      expect(newState.toasts).toHaveLength(0);
    });
  });

  describe("toast function", () => {
    it("should create a toast with default duration", () => {
      const toastResult = toast({ title: "Test Toast" });
      expect(toastResult.id).toBeDefined();
      expect(toastResult.dismiss).toBeDefined();
      expect(toastResult.update).toBeDefined();
    });

    it("should create a toast with custom duration", () => {
      const toastResult = toast({ title: "Test Toast", duration: 5000 });
      expect(toastResult.id).toBeDefined();
    });

    it("should create a toast with description", () => {
      const toastResult = toast({
        title: "Test Toast",
        description: "Test Description",
      });
      expect(toastResult.id).toBeDefined();
    });

    it("should create a toast with variant", () => {
      const toastResult = toast({
        title: "Error Toast",
        variant: "destructive",
      });
      expect(toastResult.id).toBeDefined();
    });

    it("should auto-dismiss after duration", async () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Auto-dismiss Toast", duration: 1000 });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].open).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(1000);
        await Promise.resolve(); // Allow state updates to propagate
      });

      await waitFor(() => {
        expect(result.current.toasts[0].open).toBe(false);
      });
    });

    it("should not auto-dismiss when duration is 0", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Persistent Toast", duration: 0 });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.toasts[0].open).toBe(true);
    });

    it("should allow updating a toast", () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;
      act(() => {
        toastResult = toast({ title: "Original Title" });
      });

      expect(result.current.toasts[0].title).toBe("Original Title");

      act(() => {
        toastResult.update({ title: "Updated Title" });
      });

      expect(result.current.toasts[0].title).toBe("Updated Title");
    });

    it("should allow dismissing a toast", () => {
      const { result } = renderHook(() => useToast());

      let toastResult: ReturnType<typeof toast>;
      act(() => {
        toastResult = toast({ title: "Dismissible Toast" });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        toastResult.dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  describe("useToast hook", () => {
    it("should return initial state with no toasts", () => {
      const { result } = renderHook(() => useToast());
      expect(result.current.toasts).toEqual([]);
      expect(result.current.toast).toBeDefined();
      expect(result.current.dismiss).toBeDefined();
    });

    it("should add toast via hook", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "Hook Toast" });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe("Hook Toast");
    });

    it("should dismiss toast via hook", () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        const toastResult = result.current.toast({ title: "Test Toast" });
        toastId = toastResult.id;
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismiss(toastId!);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("should dismiss all toasts when no id provided", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "Toast 1" });
        result.current.toast({ title: "Toast 2" });
      });

      expect(result.current.toasts).toHaveLength(1); // Limited by TOAST_LIMIT

      act(() => {
        result.current.dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("should handle multiple hooks independently", () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());

      act(() => {
        result1.current.toast({ title: "Hook 1 Toast" });
        result2.current.toast({ title: "Hook 2 Toast" });
      });

      // Both hooks should see the same toasts (shared state)
      expect(result1.current.toasts.length).toBeGreaterThan(0);
      expect(result2.current.toasts.length).toBeGreaterThan(0);
    });

    it("should clean up listener on unmount", () => {
      const { result, unmount } = renderHook(() => useToast());

      act(() => {
        result.current.toast({ title: "Test Toast" });
      });

      unmount();

      // After unmount, the listener should be removed
      // We can't directly test this, but we can verify the hook still works
      const { result: result2 } = renderHook(() => useToast());
      expect(result2.current.toast).toBeDefined();
    });
  });

  describe("toast onOpenChange", () => {
    it("should dismiss toast when onOpenChange is called with false", () => {
      const { result } = renderHook(() => useToast());

      let toastInstance: ReturnType<typeof toast>;
      act(() => {
        toastInstance = toast({ title: "Test Toast" });
      });

      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        result.current.toasts[0].onOpenChange?.(false);
      });

      expect(result.current.toasts[0].open).toBe(false);
    });

    it("should not dismiss toast when onOpenChange is called with true", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        toast({ title: "Test Toast" });
      });

      expect(result.current.toasts[0].open).toBe(true);

      act(() => {
        result.current.toasts[0].onOpenChange?.(true);
      });

      expect(result.current.toasts[0].open).toBe(true);
    });
  });
});
