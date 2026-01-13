import "../src/styles/globals.css";

import * as React from "react";
import ReactDOM from "react-dom/client";
import {
  FaGithub,
  FaLinkedin,
  FaCoffee,
  FaPowerOff,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Button } from "../src/components/ui/button";
import { Card } from "../src/components/ui/card";
import { cn } from "../src/lib/utils";
import type { QueueState } from "../src/types";

function Popup() {
  const [isEnabled, setIsEnabled] = React.useState(true);
  const [queueState, setQueueState] = React.useState<QueueState>({
    isRunning: false,
    isPaused: false,
    currentPromptId: null,
    processedCount: 0,
    totalCount: 0,
    queueStartTime: undefined,
  });

  React.useEffect(() => {
    loadState();

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.extensionEnabled) {
        setIsEnabled(changes.extensionEnabled.newValue ?? true);
      }
      if (changes.queueState) {
        setQueueState((prev) => ({ ...prev, ...changes.queueState.newValue }));
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () =>
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
  }, []);

  const loadState = async () => {
    const result = await chrome.storage.local.get([
      "extensionEnabled",
      "queueState",
    ]);
    setIsEnabled(result.extensionEnabled ?? true);
    if (result.queueState) {
      setQueueState((prev) => ({ ...prev, ...result.queueState }));
    }
  };

  const toggleEnabled = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await chrome.storage.local.set({ extensionEnabled: newValue });

    if (!newValue && queueState.isRunning) {
      await chrome.runtime.sendMessage({ action: "stopQueue" });
    }
  };

  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      await chrome.runtime.sendMessage({
        action: "openSidePanel",
        tabId: tab.id,
      });
      window.close();
    }
  };

  return (
    <div className="w-[280px] p-4 bg-background">
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon48.png" alt="Sora Queue" className="w-8 h-8" />
            <div>
              <h1 className="text-sm font-semibold">Sora Auto Queue</h1>
              <p className="text-xs text-muted-foreground">v2.5.0</p>
            </div>
          </div>
          <button
            onClick={toggleEnabled}
            className={cn(
              "p-2 rounded-full transition-all",
              isEnabled
                ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
            title={isEnabled ? "Disable extension" : "Enable extension"}
          >
            <FaPowerOff className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "text-center py-2 px-3 rounded-md text-xs font-medium",
            isEnabled
              ? queueState.isRunning
                ? "bg-green-500/10 text-green-600"
                : "bg-blue-500/10 text-blue-600"
              : "bg-muted text-muted-foreground",
          )}
        >
          {!isEnabled
            ? "Extension Disabled"
            : queueState.isRunning
              ? queueState.isPaused
                ? `Paused (${queueState.processedCount}/${queueState.totalCount})`
                : `Running (${queueState.processedCount}/${queueState.totalCount})`
              : "Ready"}
        </div>

        <Button
          onClick={openSidePanel}
          className="w-full gap-2"
          variant="default"
        >
          <FaExternalLinkAlt className="h-3.5 w-3.5" />
          Open Queue Manager
        </Button>

        <div className="flex items-center justify-center gap-4 pt-2 border-t">
          <a
            href="https://github.com/YosefHayim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="GitHub"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/yosef-hayim-sabag/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="LinkedIn"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
          <a
            href="https://buymeacoffee.com/yosefhayim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-yellow-500 transition-colors"
            title="Buy me a coffee"
          >
            <FaCoffee className="h-5 w-5" />
          </a>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Made with love by Yosef Sabag
        </p>
      </Card>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<Popup />);
}

export default Popup;
