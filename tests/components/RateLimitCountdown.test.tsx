import "@testing-library/jest-dom";

import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RateLimitCountdown } from "../../src/components/RateLimitCountdown";
import type { RateLimitState } from "../../src/types";

describe("RateLimitCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not render when not rate limited", () => {
    const rateLimitState: RateLimitState = { isLimited: false };
    const { container } = render(
      <RateLimitCountdown rateLimitState={rateLimitState} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render warning when rate limited", () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
      message: "Daily limit reached",
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} />);
    expect(
      screen.getByText("Daily Generation Limit Reached"),
    ).toBeInTheDocument();
    expect(screen.getByText("Daily limit reached")).toBeInTheDocument();
  });

  it("should display countdown timer", () => {
    const futureTime = new Date(Date.now() + 3661000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} />);
    expect(screen.getByText("Resets in:")).toBeInTheDocument();
  });

  it("should call onDismiss when dismiss button clicked", () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
    };
    const onDismiss = jest.fn();
    render(
      <RateLimitCountdown
        rateLimitState={rateLimitState}
        onDismiss={onDismiss}
      />,
    );

    const dismissButton = screen.getByRole("button");
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("should show compact version when compact prop is true", () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} compact />);
    expect(screen.getByText("Rate limited")).toBeInTheDocument();
    expect(
      screen.queryByText("Daily Generation Limit Reached"),
    ).not.toBeInTheDocument();
  });

  it("should display credits info when available", () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
      remainingCredits: 0,
      maxCredits: 50,
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} />);
    expect(screen.getByText(/Credits: 0 \/ 50/)).toBeInTheDocument();
  });

  it("should show expired message when time has passed", () => {
    const pastTime = new Date(Date.now() - 1000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: pastTime,
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} />);
    expect(
      screen.getByText("Rate limit has reset! You can generate again."),
    ).toBeInTheDocument();
  });

  it("should update countdown every second", () => {
    const futureTime = new Date(Date.now() + 65000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
    };
    render(<RateLimitCountdown rateLimitState={rateLimitState} />);

    const initialContent =
      screen.getByText("Resets in:").parentElement?.textContent;

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const updatedContent =
      screen.getByText("Resets in:").parentElement?.textContent;
    expect(initialContent).not.toBe(updatedContent);
  });

  it("should call onDismiss when countdown expires", () => {
    const futureTime = new Date(Date.now() + 1000).toISOString();
    const rateLimitState: RateLimitState = {
      isLimited: true,
      resetAt: futureTime,
    };
    const onDismiss = jest.fn();
    render(
      <RateLimitCountdown
        rateLimitState={rateLimitState}
        onDismiss={onDismiss}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onDismiss).toHaveBeenCalled();
  });
});
