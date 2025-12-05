import * as React from "react";
import {
  FaSync,
  FaCheckCircle,
  FaExclamationCircle,
  FaImage,
  FaVideo,
  FaSquare,
  FaHashtag,
} from "react-icons/fa";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/utils";
import type { DetectedSettings } from "../types";
import { log } from "../utils/logger";

interface DetectedSettingsProps {
  settings: DetectedSettings | null;
  onSync: () => void;
  loading?: boolean;
}

export function DetectedSettings({
  settings,
  onSync,
  loading,
}: DetectedSettingsProps) {
  if (!settings) {
    return null;
  }

  const hasSettings =
    settings.mediaType || settings.aspectRatio || settings.variations;

  if (!hasSettings && !settings.success) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Could not detect settings. Make sure Sora page is open.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSync}
              disabled={loading}
            >
              <FaSync className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasSettings) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FaCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-800 dark:text-green-200">
                Detected:
              </span>
            </div>

            {settings.mediaType && (
              <Badge variant="outline" className="gap-1 text-xs">
                {settings.mediaType === "video" ? (
                  <FaVideo className="h-3 w-3" />
                ) : (
                  <FaImage className="h-3 w-3" />
                )}
                {settings.mediaType.charAt(0).toUpperCase() +
                  settings.mediaType.slice(1)}
              </Badge>
            )}

            {settings.aspectRatio && (
              <Badge variant="outline" className="gap-1 text-xs">
                <FaSquare className="h-3 w-3" />
                {settings.aspectRatio}
              </Badge>
            )}

            {settings.variations && (
              <Badge variant="outline" className="gap-1 text-xs">
                <FaHashtag className="h-3 w-3" />
                {settings.variations}v
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={loading}
            title="Sync settings from Sora page"
          >
            <FaSync className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
