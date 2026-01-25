import * as React from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuCrown,
  LuGift,
} from "react-icons/lu";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface PricingScreenProps {
  onBack?: () => void;
  onStartTrial?: () => void;
  className?: string;
}

export function PricingScreen({
  onBack,
  onStartTrial,
  className,
}: PricingScreenProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="flex items-center justify-center border-b border-border py-3 px-4 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-4 text-foreground hover:text-foreground/80"
            title="Go back"
          >
            <LuArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-foreground">Upgrade</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col items-center gap-4">
        <div className="w-full flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <LuCrown className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center">
            Choose Your Plan
          </h2>
          <p className="text-[13px] text-muted-foreground text-center">
            Start free or unlock unlimited power
          </p>
        </div>

        <div className="w-full bg-card border border-border rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-foreground">Free</span>
            <div className="bg-muted rounded-full px-2.5 py-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Current
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-extrabold text-foreground">
              $0
            </span>
            <span className="text-[13px] text-muted-foreground">forever</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-foreground">
                10 daily automated prompts
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-foreground">
                Basic queue management
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              <span className="text-xs text-foreground">Manual downloads</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-card border-2 border-primary rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              Lifetime License
            </span>
            <div className="bg-amber-500 rounded-full px-2.5 py-1">
              <span className="text-[11px] font-semibold text-white">
                Best Value
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">$</span>
            <span className="text-5xl font-extrabold text-foreground">5</span>
            <span className="text-sm text-muted-foreground">once</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-foreground">
                Unlimited prompt generation
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-foreground">
                All AI providers (GPT-4, Claude, Gemini)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-foreground">
                Auto-download generated media
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-foreground">
                Priority support
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <LuCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-[13px] text-foreground">
                Lifetime updates included
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-blue-500/10 border border-blue-500 rounded-md py-2.5 px-4 flex items-center justify-center gap-2">
          <LuGift className="h-[18px] w-[18px] text-blue-500" />
          <span className="text-[13px] font-medium text-blue-500">
            14-day free trial • No credit card required
          </span>
        </div>

        <Button
          onClick={onStartTrial}
          className="w-full h-12 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2 text-[15px] font-semibold"
        >
          Start Free Trial
          <LuArrowRight className="h-[18px] w-[18px]" />
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          30-day money back guarantee
        </p>
      </div>
    </div>
  );
}
