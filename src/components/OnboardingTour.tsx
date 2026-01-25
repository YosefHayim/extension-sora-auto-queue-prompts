import * as React from "react";
import { Button } from "./ui/button";
import { FaPlay, FaTimes, FaRocket } from "react-icons/fa";

interface OnboardingTourProps {
  onComplete: () => void;
  onLaunchDemo: () => void;
}

export function OnboardingTour({
  onComplete,
  onLaunchDemo,
}: OnboardingTourProps) {
  function handleLaunchDemo() {
    onLaunchDemo();
    onComplete();
  }

  return (
    <div className="tour-overlay">
      <div
        className="tour-tooltip"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "320px",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FaRocket className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base text-foreground">
              Welcome to Sora Queue
            </h3>
          </div>
          <button
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Skip"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Automate your Sora AI workflow. Generate prompts, queue them up, and
          let the extension handle the rest.
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onComplete}
            className="flex-1 h-9 text-sm"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleLaunchDemo}
            className="flex-1 h-9 text-sm gap-1.5"
          >
            <FaPlay className="h-3 w-3" />
            Launch Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
