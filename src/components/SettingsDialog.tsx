import * as React from "react";

import type { ApiProvider, DetectedSettings, PromptConfig } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FaCheckCircle, FaCog, FaExclamationCircle, FaKey, FaMagic, FaPlayCircle, FaSave, FaSpinner, FaTimes, FaRobot, FaBrain, FaGoogle } from "react-icons/fa";
import { recognizeApiProvider, verifyApiKey } from "../utils/apiKeyUtils";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { log } from "../utils/logger";
import { cn } from "../lib/utils";
import { useToast } from "./ui/use-toast";

interface SettingsDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<PromptConfig>) => Promise<void>;
  detectedSettings?: DetectedSettings | null;
  showOnly?: "api" | "generation" | "all";
}

export function SettingsDialog({ config, isOpen, onClose, onSave, detectedSettings, showOnly = "all" }: SettingsDialogProps) {
  const [formData, setFormData] = React.useState<PromptConfig>(config);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [verificationStatus, setVerificationStatus] = React.useState<{ valid: boolean; error?: string } | null>(null);
  const [detectedProvider, setDetectedProvider] = React.useState<ApiProvider | null>(null);
  const { toast } = useToast();

  // Update form data when dialog opens or detected settings change
  React.useEffect(() => {
    if (isOpen) {
      const initialData = { ...config };

      // Apply detected settings as defaults if available
      if (detectedSettings?.success) {
        if (detectedSettings.mediaType) {
          initialData.mediaType = detectedSettings.mediaType;
        }
        if (detectedSettings.variations) {
          initialData.variationCount = detectedSettings.variations as 2 | 4;
        }
      }

      setFormData(initialData);
      setError("");
      setSuccess("");
      setVerificationStatus(null);

      // Detect provider from existing API key
      if (initialData.apiKey) {
        const provider = recognizeApiProvider(initialData.apiKey);
        setDetectedProvider(provider);
        if (provider && !initialData.apiProvider) {
          initialData.apiProvider = provider;
        }
      } else {
        setDetectedProvider(null);
      }
    }
  }, [isOpen, config, detectedSettings]);

  // Auto-detect provider when API key changes
  React.useEffect(() => {
    if (formData.apiKey) {
      const provider = recognizeApiProvider(formData.apiKey);
      setDetectedProvider(provider);
      if (provider) {
        setFormData((prev) => ({ ...prev, apiProvider: provider }));
      }
    } else {
      setDetectedProvider(null);
      setVerificationStatus(null);
    }
  }, [formData.apiKey]);

  // For tab-based usage, always render (isOpen check is for dialog mode)

  function handleChange(field: keyof PromptConfig, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      log.ui.action("SettingsDialog:Save");

      // Validation
      if (formData.minDelayMs < 2000 || formData.minDelayMs > 60000) {
        setError("Min delay must be between 2-60 seconds");
        setLoading(false);
        return;
      }

      if (formData.maxDelayMs < formData.minDelayMs || formData.maxDelayMs > 60000) {
        setError("Max delay must be >= min delay and <= 60 seconds");
        setLoading(false);
        return;
      }

      if (formData.batchSize < 1 || formData.batchSize > 100) {
        setError("Batch size must be between 1-100");
        setLoading(false);
        return;
      }

      await onSave(formData);
      setSuccess("Settings saved successfully!");
      log.ui.action("SettingsDialog:Success");

      // Show success toast
      toast({
        title: "Settings successfully saved",
        description: "Your settings have been saved successfully.",
        duration: 3000,
      });

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMsg);
      log.ui.error("SettingsDialog:Save", err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }

  async function handleVerifyApiKey() {
    if (!formData.apiKey || formData.apiKey.trim().length === 0) {
      setVerificationStatus({ valid: false, error: "Please enter an API key first" });
      return;
    }

    const provider = formData.apiProvider || detectedProvider;
    if (!provider) {
      setVerificationStatus({ valid: false, error: "Please select an API provider" });
      return;
    }

    setVerifying(true);
    setVerificationStatus(null);
    setError("");

    try {
      log.ui.action("SettingsDialog:VerifyApiKey", { provider });
      const result = await verifyApiKey(formData.apiKey, provider);
      setVerificationStatus(result);

      if (result.valid) {
        toast({
          title: "API key verified successfully!",
          description: "Your API key is valid and ready to use.",
          duration: 3000,
        });
      } else {
        setError(result.error || "API key verification failed");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Verification failed";
      setVerificationStatus({ valid: false, error: errorMsg });
      setError(errorMsg);
      log.ui.error("SettingsDialog:VerifyApiKey", err);
    } finally {
      setVerifying(false);
    }
  }

  function getProviderIcon(provider: ApiProvider) {
    switch (provider) {
      case "openai":
        return <FaRobot className="h-4 w-4" />;
      case "anthropic":
        return <FaBrain className="h-4 w-4" />;
      case "google":
        return <FaGoogle className="h-4 w-4" />;
      default:
        return null;
    }
  }

  function getProviderDisplayName(provider: ApiProvider): string {
    switch (provider) {
      case "openai":
        return "OpenAI (ChatGPT)";
      case "anthropic":
        return "Anthropic (Claude)";
      case "google":
        return "Google (Gemini)";
      default:
        return provider;
    }
  }

  function getProviderApiKeyUrl(provider: ApiProvider): string {
    switch (provider) {
      case "openai":
        return "https://platform.openai.com/api-keys";
      case "anthropic":
        return "https://console.anthropic.com/settings/keys";
      case "google":
        return "https://makersuite.google.com/app/apikey";
      default:
        return "#";
    }
  }

  const isDialogMode = showOnly === "all";
  
  if (isDialogMode && !isOpen) return null;
  
  const content = (
    <Card className={cn("w-full", isDialogMode ? "p-6 max-w-2xl my-auto max-h-[90vh] overflow-y-auto" : showOnly !== "all" ? "p-0 border-0 shadow-none" : "p-6")} onClick={(e) => e.stopPropagation()}>
        {/* Header - only show in dialog mode */}
        {isDialogMode && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaCog className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Configuration */}
          {(showOnly === "all" || showOnly === "api") && (
            showOnly === "all" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">API Configuration</CardTitle>
                  </div>
                  <CardDescription>Configure your AI API settings for prompt generation (OpenAI, Anthropic, or Google)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key (auto-detected by pattern)..."
                    value={formData.apiKey || ""}
                    onChange={(e) => handleChange("apiKey", e.target.value)}
                    disabled={loading || verifying}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyApiKey}
                    disabled={loading || verifying || !formData.apiKey || (!formData.apiProvider && !detectedProvider)}
                    title="Verify API key"
                  >
                    {verifying ?
                      <>
                        <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    : <>
                        <FaCheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    }
                  </Button>
                </div>
                {detectedProvider && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <FaCheckCircle className="h-3 w-3" />
                    <span className="flex items-center gap-1.5">
                      Detected: {getProviderIcon(detectedProvider)}
                      {getProviderDisplayName(detectedProvider)}
                    </span>
                  </div>
                )}
                {verificationStatus && (
                  <div
                    className={`flex items-center gap-2 text-xs p-2 rounded-md ${
                      verificationStatus.valid ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {verificationStatus.valid ?
                      <>
                        <FaCheckCircle className="h-3 w-3" />
                        <span>API key verified successfully!</span>
                      </>
                    : <>
                        <FaExclamationCircle className="h-3 w-3" />
                        <span>{verificationStatus.error || "Verification failed"}</span>
                      </>
                    }
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Your API key is stored locally and never shared</p>
                  {formData.apiProvider && (
                    <a
                      href={getProviderApiKeyUrl(formData.apiProvider)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1.5"
                    >
                      Get your API key from {getProviderIcon(formData.apiProvider)} {getProviderDisplayName(formData.apiProvider)} →
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiProvider">API Provider</Label>
                <div className="relative">
                  {formData.apiProvider && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {getProviderIcon(formData.apiProvider)}
                    </div>
                  )}
                  <select
                    id="apiProvider"
                    value={formData.apiProvider || ""}
                    onChange={(e) => handleChange("apiProvider", (e.target.value as ApiProvider) || undefined)}
                    disabled={loading || verifying}
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-input bg-background",
                      formData.apiProvider && "pl-9"
                    )}
                  >
                    <option value="">Select provider (or auto-detect from key)</option>
                    <option value="openai">OpenAI (ChatGPT)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="google">Google (Gemini)</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {detectedProvider ?
                    <span className="flex items-center gap-1.5">
                      Auto-detected as {getProviderIcon(detectedProvider)} {getProviderDisplayName(detectedProvider)}. You can override by selecting a different provider.
                    </span>
                  : "If the API key pattern isn't recognized, please select the provider manually."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contextPrompt">Default Context Prompt</Label>
                <Textarea
                  id="contextPrompt"
                  placeholder="e.g., Create cinematic shots of nature landscapes"
                  value={formData.contextPrompt}
                  onChange={(e) => handleChange("contextPrompt", e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">This prompt will be used as the base context for all generated prompts</p>
              </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">API Configuration</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Configure your AI API settings for prompt generation (OpenAI, Anthropic, or Google)</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key (auto-detected by pattern)..."
                        value={formData.apiKey || ""}
                        onChange={(e) => handleChange("apiKey", e.target.value)}
                        disabled={loading || verifying}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyApiKey}
                        disabled={loading || verifying || !formData.apiKey || (!formData.apiProvider && !detectedProvider)}
                        title="Verify API key"
                      >
                        {verifying ?
                          <>
                            <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        : <>
                            <FaCheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </>
                        }
                      </Button>
                    </div>
                    {detectedProvider && (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <FaCheckCircle className="h-3 w-3" />
                        <span className="flex items-center gap-1.5">
                          Detected: {getProviderIcon(detectedProvider)}
                          {getProviderDisplayName(detectedProvider)}
                        </span>
                      </div>
                    )}
                    {verificationStatus && (
                      <div
                        className={`flex items-center gap-2 text-xs p-2 rounded-md ${
                          verificationStatus.valid ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {verificationStatus.valid ?
                          <>
                            <FaCheckCircle className="h-3 w-3" />
                            <span>API key verified successfully!</span>
                          </>
                        : <>
                            <FaExclamationCircle className="h-3 w-3" />
                            <span>{verificationStatus.error || "Verification failed"}</span>
                          </>
                        }
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Your API key is stored locally and never shared</p>
                      {formData.apiProvider && (
                        <a
                          href={getProviderApiKeyUrl(formData.apiProvider)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1.5"
                        >
                          Get your API key from {getProviderIcon(formData.apiProvider)} {getProviderDisplayName(formData.apiProvider)} →
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiProvider">API Provider</Label>
                    <div className="relative">
                      {formData.apiProvider && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {getProviderIcon(formData.apiProvider)}
                        </div>
                      )}
                      <select
                        id="apiProvider"
                        value={formData.apiProvider || ""}
                        onChange={(e) => handleChange("apiProvider", (e.target.value as ApiProvider) || undefined)}
                        disabled={loading || verifying}
                        className={cn(
                          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 border-input bg-background",
                          formData.apiProvider && "pl-9"
                        )}
                      >
                        <option value="">Select provider (or auto-detect from key)</option>
                        <option value="openai">OpenAI (ChatGPT)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google (Gemini)</option>
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detectedProvider ?
                        <span className="flex items-center gap-1.5">
                          Auto-detected as {getProviderIcon(detectedProvider)} {getProviderDisplayName(detectedProvider)}. You can override by selecting a different provider.
                        </span>
                      : "If the API key pattern isn't recognized, please select the provider manually."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contextPrompt">Default Context Prompt</Label>
                    <Textarea
                      id="contextPrompt"
                      placeholder="e.g., Create cinematic shots of nature landscapes"
                      value={formData.contextPrompt}
                      onChange={(e) => handleChange("contextPrompt", e.target.value)}
                      disabled={loading}
                      rows={3}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">This prompt will be used as the base context for all generated prompts</p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Sora Generation Settings */}
          {(showOnly === "all" || showOnly === "generation") && (
          <Card className={detectedSettings?.success && (detectedSettings.mediaType || detectedSettings.variations) ? "border-green-500 border-2" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaMagic className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Sora Generation Settings</CardTitle>
                </div>
                {detectedSettings?.success && (detectedSettings.mediaType || detectedSettings.variations) && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Using detected settings from Sora page</span>
                )}
              </div>
              <CardDescription>Configure how prompts are generated for Sora</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <div className="flex items-center gap-2">
                    {detectedSettings?.mediaType && <span className="text-xs text-green-600 dark:text-green-400 font-medium">(Detected)</span>}
                  </div>
                  <select
                    id="mediaType"
                    value={formData.mediaType}
                    onChange={(e) => handleChange("mediaType", e.target.value as "video" | "image")}
                    disabled={loading}
                    className={`
                      flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
                      ${detectedSettings?.mediaType ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/20" : "border-input bg-background"}
                    `}
                  >
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variationCount">Variations</Label>
                  <div className="flex items-center gap-2">
                    {detectedSettings?.variations && <span className="text-xs text-green-600 dark:text-green-400 font-medium">(Detected)</span>}
                  </div>
                  <select
                    id="variationCount"
                    value={formData.variationCount}
                    onChange={(e) => handleChange("variationCount", parseInt(e.target.value) as 2 | 4)}
                    disabled={loading}
                    className={`
                      flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
                      ${detectedSettings?.variations ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/20" : "border-input bg-background"}
                    `}
                  >
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.batchSize}
                    onChange={(e) => handleChange("batchSize", parseInt(e.target.value) || 1)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Number of prompts to generate at once</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useSecretPrompt}
                      onChange={(e) => handleChange("useSecretPrompt", e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Enhanced Prompts</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Add technical details to prompts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Queue Processing Settings */}
          {(showOnly === "all" || showOnly === "generation") && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FaPlayCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Queue Processing Settings</CardTitle>
              </div>
              <CardDescription>Configure how the queue processes and submits prompts to Sora</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minDelayMs">Min Delay (seconds)</Label>
                    <Input
                      id="minDelayMs"
                      type="number"
                      min="2"
                      max="60"
                      value={formData.minDelayMs / 1000}
                      onChange={(e) => handleChange("minDelayMs", (parseInt(e.target.value) || 2) * 1000)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDelayMs">Max Delay (seconds)</Label>
                    <Input
                      id="maxDelayMs"
                      type="number"
                      min="2"
                      max="60"
                      value={formData.maxDelayMs / 1000}
                      onChange={(e) => handleChange("maxDelayMs", (parseInt(e.target.value) || 5) * 1000)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Random delay between {formData.minDelayMs / 1000}-{formData.maxDelayMs / 1000} seconds helps avoid bot detection
                </p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRun}
                      onChange={(e) => handleChange("autoRun", e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Auto-start Queue</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically start processing the queue when prompts are added</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoGenerateOnEmpty}
                      onChange={(e) => handleChange("autoGenerateOnEmpty", e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Auto-generate on Empty Queue</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically generate new prompts when the queue becomes empty</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoGenerateOnReceived}
                      onChange={(e) => handleChange("autoGenerateOnReceived", e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>Auto-generate on Prompt Received</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically generate new prompts when prompts are received from external sources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

          {success && <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-md">{success}</div>}

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ?
                <>
                  <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                  Saving Settings...
                </>
              : <>
                  <FaSave className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              }
            </Button>
            {isDialogMode && (
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    );

  if (isDialogMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
        {content}
      </div>
    );
  }

  return content;
}
