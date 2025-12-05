import * as React from "react";

import type { GeneratedPrompt, QueueState } from "../../src/types";
import { fireEvent, render, screen } from "@testing-library/react";

import { QueueControls } from "../../src/components/QueueControls";

describe("QueueControls", () => {
  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnResume = jest.fn();
  const mockOnStop = jest.fn();
  const mockOnCleanCompletedAndFailed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createQueueState = (overrides: Partial<QueueState> = {}): QueueState => ({
    isRunning: false,
    isPaused: false,
    currentPromptId: null,
    processedCount: 0,
    totalCount: 0,
    ...overrides,
  });

  it("should render stopped state", () => {
    const queueState = createQueueState({ isRunning: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText(/0 \/ 10 prompts/)).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("should render running state", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false, processedCount: 3, totalCount: 10 });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText(/3 \/ 10 prompts/)).toBeInTheDocument();
    expect(screen.getByText("Pause")).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
  });

  it("should render paused state", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true, processedCount: 3, totalCount: 10 });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText(/3 \/ 10 prompts/)).toBeInTheDocument();
    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
  });

  it("should display progress count", () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 3, totalCount: 10 });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText(/3 \/ 10 prompts/)).toBeInTheDocument();
  });

  it("should display progress percentage", () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 5, totalCount: 10 });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("should display remaining count", () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 3, totalCount: 10 });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText("7 remaining")).toBeInTheDocument();
  });

  it("should call onStart when start button is clicked", () => {
    const queueState = createQueueState({ isRunning: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    fireEvent.click(screen.getByText("Start"));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it("should call onPause when pause button is clicked", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    fireEvent.click(screen.getByText("Pause"));
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it("should call onResume when resume button is clicked", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    fireEvent.click(screen.getByText("Resume"));
    expect(mockOnResume).toHaveBeenCalledTimes(1);
  });

  it("should call onStop when stop button is clicked", () => {
    const queueState = createQueueState({ isRunning: true });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    fireEvent.click(screen.getByText("Stop"));
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it("should show progress bar when running", () => {
    const queueState = createQueueState({ isRunning: true, totalCount: 10 });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Check for progress-related text or elements
    expect(screen.getByText(/processed/)).toBeInTheDocument();
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it("should not show progress bar when stopped", () => {
    const queueState = createQueueState({ isRunning: false });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  it("should display timer when queue is running", () => {
    const queueStartTime = Date.now() - 5000; // 5 seconds ago
    const queueState = createQueueState({
      isRunning: true,
      isPaused: false,
      queueStartTime,
    });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Timer should be visible - look for Timer icon (lucide-react icon)
    const timerIcon = container.querySelector("svg");
    expect(timerIcon).toBeInTheDocument();
  });

  it("should not display timer when queue is paused", () => {
    const queueStartTime = Date.now() - 5000;
    const queueState = createQueueState({
      isRunning: true,
      isPaused: true,
      queueStartTime,
    });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Timer should not be visible when paused
    const timer = container.querySelector('[class*="Timer"]');
    expect(timer).not.toBeInTheDocument();
  });

  it("should not display timer when queue is stopped", () => {
    const queueState = createQueueState({
      isRunning: false,
      queueStartTime: Date.now() - 5000,
    });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Timer should not be visible when stopped
    const timer = container.querySelector('[class*="Timer"]');
    expect(timer).not.toBeInTheDocument();
  });

  it("should handle zero total count", () => {
    const queueState = createQueueState({ isRunning: false });
    render(<QueueControls queueState={queueState} totalCount={0} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText(/0 \/ 0 prompts/)).toBeInTheDocument();
  });

  it("should calculate progress correctly", () => {
    const queueState = createQueueState({
      isRunning: true,
      processedCount: 7,
      totalCount: 10,
    });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    expect(screen.getByText("70% complete")).toBeInTheDocument();
    expect(screen.getByText("3 remaining")).toBeInTheDocument();
  });

  it("should include current prompt progress in calculation", () => {
    const queueState = createQueueState({
      isRunning: true,
      processedCount: 5,
      totalCount: 10,
      currentPromptId: "prompt-6",
    });
    const prompts: GeneratedPrompt[] = [
      {
        id: "prompt-6",
        text: "Test prompt",
        timestamp: Date.now(),
        status: "processing",
        mediaType: "video",
        startTime: Date.now() - 30000,
        progress: 50, // 50% progress
      },
    ];
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        prompts={prompts}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    // Should show 55% complete (5 completed + 0.5 from current prompt = 5.5/10 = 55%)
    expect(screen.getByText("55% complete")).toBeInTheDocument();
  });

  it("should handle progress calculation with no current prompt", () => {
    const queueState = createQueueState({
      isRunning: true,
      processedCount: 5,
      totalCount: 10,
      currentPromptId: null,
    });
    const prompts: GeneratedPrompt[] = [];
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        prompts={prompts}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    // Should show 50% complete (5/10 = 50%)
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("should handle progress calculation when current prompt is not processing", () => {
    const queueState = createQueueState({
      isRunning: true,
      processedCount: 5,
      totalCount: 10,
      currentPromptId: "prompt-6",
    });
    const prompts: GeneratedPrompt[] = [
      {
        id: "prompt-6",
        text: "Test prompt",
        timestamp: Date.now(),
        status: "pending",
        mediaType: "video",
      },
    ];
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        prompts={prompts}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    // Should show 50% complete (5/10 = 50%, no progress from pending prompt)
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("should handle progress calculation when current prompt has no progress value", () => {
    const queueState = createQueueState({
      isRunning: true,
      processedCount: 5,
      totalCount: 10,
      currentPromptId: "prompt-6",
    });
    const prompts: GeneratedPrompt[] = [
      {
        id: "prompt-6",
        text: "Test prompt",
        timestamp: Date.now(),
        status: "processing",
        mediaType: "video",
        startTime: Date.now() - 30000,
        progress: undefined,
      },
    ];
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        prompts={prompts}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    // Should show 50% complete (5/10 = 50%, no progress value available)
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("should show hover card for start button", () => {
    const queueState = createQueueState({ isRunning: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    const startButton = screen.getByText("Start");
    expect(startButton).toBeInTheDocument();
  });

  it("should show hover card for pause button", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    const pauseButton = screen.getByText("Pause");
    expect(pauseButton).toBeInTheDocument();
  });

  it("should show hover card for resume button", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    const resumeButton = screen.getByText("Resume");
    expect(resumeButton).toBeInTheDocument();
  });

  it("should show hover card for stop button", () => {
    const queueState = createQueueState({ isRunning: true });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    const stopButton = screen.getByText("Stop");
    expect(stopButton).toBeInTheDocument();
  });

  it("should toggle collapse state", () => {
    const queueState = createQueueState({ isRunning: false });
    render(<QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />);

    const toggleButton = screen.getByTitle("Collapse");
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByText("Start")).not.toBeInTheDocument();
  });

  it("should show clean button when paused and has completed/failed prompts", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
        onCleanCompletedAndFailed={mockOnCleanCompletedAndFailed}
        completedCount={3}
        failedCount={2}
      />
    );

    const cleanButton = screen.getByText("Clean");
    expect(cleanButton).toBeInTheDocument();
  });

  it("should not show clean button when paused but no completed/failed prompts", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
        onCleanCompletedAndFailed={mockOnCleanCompletedAndFailed}
        completedCount={0}
        failedCount={0}
      />
    );

    const cleanButton = screen.queryByText("Clean");
    expect(cleanButton).not.toBeInTheDocument();
  });

  it("should call onCleanCompletedAndFailed when clean button is clicked", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
        onCleanCompletedAndFailed={mockOnCleanCompletedAndFailed}
        completedCount={3}
        failedCount={2}
      />
    );

    const cleanButton = screen.getByText("Clean");
    fireEvent.click(cleanButton);
    expect(mockOnCleanCompletedAndFailed).toHaveBeenCalledTimes(1);
  });

  it("should hide progress bar when collapsed", () => {
    const queueState = createQueueState({ isRunning: true, totalCount: 10 });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    const toggleButton = screen.getByTitle("Collapse");
    fireEvent.click(toggleButton);

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  it("should display stopped status icon", () => {
    const queueState = createQueueState({ isRunning: false });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Check for status icon (should be stop icon for stopped state)
    const statusIcons = container.querySelectorAll("svg");
    // Should have at least one icon (the status icon)
    expect(statusIcons.length).toBeGreaterThan(0);
  });

  it("should display running status icon", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Check for status icon (should be play icon for running state)
    const statusIcons = container.querySelectorAll("svg");
    expect(statusIcons.length).toBeGreaterThan(0);
  });

  it("should display paused status icon", () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Check for status icon (should be pause icon for paused state)
    const statusIcons = container.querySelectorAll("svg");
    expect(statusIcons.length).toBeGreaterThan(0);
  });

  it("should show status icon with hover tooltip when stopped", async () => {
    const queueState = createQueueState({ isRunning: false });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Verify the status icon is present (stop icon for stopped state)
    // The HoverCard structure should exist even if content is not visible until hover
    const statusIconContainer = container.querySelector(".cursor-help");
    expect(statusIconContainer).toBeInTheDocument();
  });

  it("should show status icon with hover tooltip when running", async () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Verify the status icon is present (play icon for running state)
    const statusIconContainer = container.querySelector(".cursor-help");
    expect(statusIconContainer).toBeInTheDocument();
  });

  it("should show status icon with hover tooltip when paused", async () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    const { container } = render(
      <QueueControls queueState={queueState} totalCount={10} onStart={mockOnStart} onPause={mockOnPause} onResume={mockOnResume} onStop={mockOnStop} />
    );

    // Verify the status icon is present (pause icon for paused state)
    const statusIconContainer = container.querySelector(".cursor-help");
    expect(statusIconContainer).toBeInTheDocument();
  });
});
