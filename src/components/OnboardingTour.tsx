import * as React from "react";
import { Button } from "./ui/button";
import { FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="queue-tab"]',
    title: "Queue Tab",
    description:
      "Manage your prompt queue here. Add, edit, reorder, and process prompts for Sora.",
    position: "bottom",
  },
  {
    target: '[data-tour="add-prompts"]',
    title: "Add Prompts",
    description:
      "Click here to add new prompts. You can generate with AI, import from CSV, or add manually.",
    position: "bottom",
  },
  {
    target: '[data-tour="queue-controls"]',
    title: "Queue Controls",
    description:
      "Start, pause, resume, or stop the queue. The queue automatically processes prompts one by one.",
    position: "bottom",
  },
  {
    target: '[data-tour="help"]',
    title: "Need Help?",
    description:
      "Click this button anytime to see this tour again. Happy creating!",
    position: "bottom",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [spotlightRect, setSpotlightRect] = React.useState<DOMRect | null>(
    null,
  );

  React.useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    const target = document.querySelector(step.target);

    if (target) {
      const rect = target.getBoundingClientRect();
      setSpotlightRect(rect);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!spotlightRect)
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const padding = 12;
    const tooltipWidth = 280;

    switch (step.position) {
      case "top":
        return {
          bottom: `calc(100% - ${spotlightRect.top - padding}px)`,
          left: Math.max(
            padding,
            Math.min(
              spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - padding,
            ),
          ),
        };
      case "bottom":
        return {
          top: spotlightRect.bottom + padding,
          left: Math.max(
            padding,
            Math.min(
              spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2,
              window.innerWidth - tooltipWidth - padding,
            ),
          ),
        };
      case "left":
        return {
          top: spotlightRect.top + spotlightRect.height / 2,
          right: `calc(100% - ${spotlightRect.left - padding}px)`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: spotlightRect.top + spotlightRect.height / 2,
          left: spotlightRect.right + padding,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: spotlightRect.bottom + padding,
          left: spotlightRect.left,
        };
    }
  };

  return (
    <div className="tour-overlay">
      {spotlightRect && (
        <div
          className="tour-spotlight"
          style={{
            top: spotlightRect.top - 8,
            left: spotlightRect.left - 8,
            width: spotlightRect.width + 16,
            height: spotlightRect.height + 16,
          }}
        />
      )}

      <div className="tour-tooltip" style={getTooltipPosition()}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-foreground">
            {step.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Skip tour"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            className="h-7 text-xs gap-1.5"
          >
            {isLastStep ? (
              <>
                <FaCheck className="h-3 w-3" />
                Done
              </>
            ) : (
              <>
                Next
                <FaArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
