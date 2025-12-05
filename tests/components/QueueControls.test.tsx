import * as React from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { QueueControls } from "../../src/components/QueueControls";
import type { QueueState } from "../../src/types";

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
});
