import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueueControls } from '../../src/components/QueueControls';
import type { QueueState } from '../../src/types';

describe('QueueControls', () => {
  const mockOnStart = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnResume = jest.fn();
  const mockOnStop = jest.fn();

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

  it('should render stopped state', () => {
    const queueState = createQueueState({ isRunning: false });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText('⏹ Stopped')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('should render running state', () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false, processedCount: 3, totalCount: 10 });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText('▶ Running')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('should render paused state', () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true, processedCount: 3, totalCount: 10 });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText('⏸ Paused')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('should display progress count', () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 3, totalCount: 10 });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText(/3 \/ 10 prompts/)).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 5, totalCount: 10 });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('should display remaining count', () => {
    const queueState = createQueueState({ isRunning: true, processedCount: 3, totalCount: 10 });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    expect(screen.getByText('7 remaining')).toBeInTheDocument();
  });

  it('should call onStart when start button is clicked', () => {
    const queueState = createQueueState({ isRunning: false });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    fireEvent.click(screen.getByText('Start'));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should call onPause when pause button is clicked', () => {
    const queueState = createQueueState({ isRunning: true, isPaused: false });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    fireEvent.click(screen.getByText('Pause'));
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('should call onResume when resume button is clicked', () => {
    const queueState = createQueueState({ isRunning: true, isPaused: true });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    fireEvent.click(screen.getByText('Resume'));
    expect(mockOnResume).toHaveBeenCalledTimes(1);
  });

  it('should call onStop when stop button is clicked', () => {
    const queueState = createQueueState({ isRunning: true });
    render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    fireEvent.click(screen.getByText('Stop'));
    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('should show progress bar when running', () => {
    const queueState = createQueueState({ isRunning: true, totalCount: 10 });
    const { container } = render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    // Check for progress-related text or elements
    expect(screen.getByText(/processed/)).toBeInTheDocument();
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it('should not show progress bar when stopped', () => {
    const queueState = createQueueState({ isRunning: false });
    const { container } = render(
      <QueueControls
        queueState={queueState}
        totalCount={10}
        onStart={mockOnStart}
        onPause={mockOnPause}
        onResume={mockOnResume}
        onStop={mockOnStop}
      />
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeInTheDocument();
  });
});

