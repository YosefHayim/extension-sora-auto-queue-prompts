import React, { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./ui/toggle";
import { AccountCard } from "./AccountCard";
import { PlanCard } from "./PlanCard";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export const SettingsPreview: React.FC = () => {
  const [autoStart, setAutoStart] = useState(false);
  const [autoDownload, setAutoDownload] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-lg font-semibold">Settings Preview</h1>
        <p className="text-sm text-muted-foreground">
          New Pencil design layout
        </p>
      </div>

      {/* Content */}
      <div
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: "600px" }}
      >
        {/* API Configuration Section */}
        <SettingsSection title="API Configuration">
          <div className="space-y-2">
            <Label
              htmlFor="provider"
              className="text-xs font-medium text-muted-foreground"
            >
              AI Provider
            </Label>
            <Input
              id="provider"
              value="OpenAI GPT-4"
              readOnly
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="apikey"
              className="text-xs font-medium text-muted-foreground"
            >
              API Key
            </Label>
            <Input
              id="apikey"
              type="password"
              value="sk-••••••••••••••••"
              readOnly
              className="h-10"
            />
          </div>
        </SettingsSection>

        {/* Queue Settings Section */}
        <SettingsSection title="Queue Settings">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[13px] font-medium">
                Delay between prompts
              </div>
              <div className="text-[11px] text-muted-foreground">
                Random delay to avoid rate limits
              </div>
            </div>
            <div className="px-2.5 py-1.5 bg-muted rounded-md">
              <div className="text-xs font-medium">2-5 sec</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[13px] font-medium">Auto-start queue</div>
              <div className="text-[11px] text-muted-foreground">
                Start processing when prompts added
              </div>
            </div>
            <Toggle checked={autoStart} onCheckedChange={setAutoStart} />
          </div>
        </SettingsSection>

        {/* Downloads Section */}
        <SettingsSection title="Downloads">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[13px] font-medium">Auto-download media</div>
              <div className="text-[11px] text-muted-foreground">
                Save generated files automatically
              </div>
            </div>
            <Toggle checked={autoDownload} onCheckedChange={setAutoDownload} />
          </div>
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <AccountCard name="John Doe" email="john@example.com" />
          <PlanCard
            planName="Lifetime License"
            description="Unlimited access forever"
            isActive={true}
          />
        </SettingsSection>
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" className="flex-1">
          Close
        </Button>
        <Button className="flex-1">Save Changes</Button>
      </div>
    </div>
  );
};

export default SettingsPreview;
