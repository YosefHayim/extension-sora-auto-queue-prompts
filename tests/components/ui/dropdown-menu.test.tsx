import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../src/components/ui/dropdown-menu";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

describe("DropdownMenu", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should render dropdown menu with trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText("Open Menu")).toBeInTheDocument();
  });

  it("should open dropdown when trigger is clicked", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  it("should close dropdown when trigger is clicked again", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("should close dropdown when clicking outside", async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    // Wait for setTimeout to complete
    jest.advanceTimersByTime(0);

    // Click outside
    const outsideElement = document.createElement("div");
    document.body.appendChild(outsideElement);
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });

    document.body.removeChild(outsideElement);
  });

  it("should not close dropdown when clicking inside", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(0);

    const item = screen.getByText("Item 1");
    fireEvent.mouseDown(item);

    // Should still be open
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should close dropdown when menu item is clicked", async () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("should call onClick handler on menu item", async () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    fireEvent.click(item);

    expect(onClick).toHaveBeenCalled();
  });

  it('should render dropdown menu content with align="end"', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = container.querySelector(".right-0");
      expect(content).toBeInTheDocument();
    });
  });

  it('should render dropdown menu content with align="start"', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const content = container.querySelector(".left-0");
      expect(content).toBeInTheDocument();
    });
  });

  it("should render dropdown menu separator", async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const separator = container.querySelector(".h-px");
      expect(separator).toBeInTheDocument();
    });
  });

  it("should render dropdown menu label", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Label")).toBeInTheDocument();
    });
  });

  it("should call onClick handler on trigger", () => {
    const onClick = jest.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger onClick={onClick}>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    expect(onClick).toHaveBeenCalled();
  });

  it("should not attach click outside listener when dropdown is closed", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Should not have added listener yet
    expect(addEventListenerSpy).not.toHaveBeenCalledWith("mousedown", expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it("should clean up event listener on unmount", async () => {
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(0);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
  });

  it("should throw error when DropdownMenuTrigger is used outside DropdownMenu", () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<DropdownMenuTrigger>Trigger</DropdownMenuTrigger>);
    }).toThrow("DropdownMenuTrigger must be used within DropdownMenu");

    consoleError.mockRestore();
  });

  it("should throw error when DropdownMenuContent is used outside DropdownMenu", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<DropdownMenuContent>Content</DropdownMenuContent>);
    }).toThrow("DropdownMenuContent must be used within DropdownMenu");

    consoleError.mockRestore();
  });

  it("should throw error when DropdownMenuItem is used outside DropdownMenu", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<DropdownMenuItem>Item</DropdownMenuItem>);
    }).toThrow("DropdownMenuItem must be used within DropdownMenu");

    consoleError.mockRestore();
  });

  it("should handle menu item with both onClick and onSelect", async () => {
    const onClick = jest.fn();
    const onSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick} onSelect={onSelect}>
            Item 1
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    fireEvent.click(item);

    expect(onClick).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
  });

  it("should handle menu item with only onSelect", async () => {
    const onSelect = jest.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const item = screen.getByText("Item 1");
    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalled();
  });
});
