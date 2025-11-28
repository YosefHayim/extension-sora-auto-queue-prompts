import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Settings, Save, Loader2 } from 'lucide-react';
import { log } from '../utils/logger';
import type { PromptConfig } from '../types';

interface SettingsDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<PromptConfig>) => Promise<void>;
}

export function SettingsDialog({ config, isOpen, onClose, onSave }: SettingsDialogProps) {
  const [formData, setFormData] = useState<PromptConfig>(config);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  function handleChange(field: keyof PromptConfig, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      log.ui.action('SettingsDialog:Save');

      // Validation
      if (!formData.apiKey?.trim()) {
        setError('OpenAI API key is required');
        setLoading(false);
        return;
      }

      if (formData.minDelayMs < 2000 || formData.minDelayMs > 60000) {
        setError('Min delay must be between 2-60 seconds');
        setLoading(false);
        return;
      }

      if (formData.maxDelayMs < formData.minDelayMs || formData.maxDelayMs > 60000) {
        setError('Max delay must be >= min delay and <= 60 seconds');
        setLoading(false);
        return;
      }

      if (formData.batchSize < 1 || formData.batchSize > 100) {
        setError('Batch size must be between 1-100');
        setLoading(false);
        return;
      }

      await onSave(formData);
      setSuccess('Settings saved successfully!');
      log.ui.action('SettingsDialog:Success');

      // Close dialog after 1 second
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMsg);
      log.ui.error('SettingsDialog:Save', err);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-full max-w-2xl p-6 space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">API Configuration</h3>

            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={formData.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never shared
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contextPrompt">Default Context Prompt</Label>
              <Textarea
                id="contextPrompt"
                placeholder="e.g., Create cinematic shots of nature landscapes"
                value={formData.contextPrompt}
                onChange={(e) => handleChange('contextPrompt', e.target.value)}
                disabled={loading}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          {/* Generation Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Generation Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.batchSize}
                  onChange={(e) => handleChange('batchSize', parseInt(e.target.value) || 1)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type</Label>
                <select
                  id="mediaType"
                  value={formData.mediaType}
                  onChange={(e) => handleChange('mediaType', e.target.value as 'video' | 'image')}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variationCount">Variations</Label>
                <select
                  id="variationCount"
                  value={formData.variationCount}
                  onChange={(e) => handleChange('variationCount', parseInt(e.target.value) as 2 | 4)}
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="2">2</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.useSecretPrompt}
                    onChange={(e) => handleChange('useSecretPrompt', e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span>Enhanced Prompts</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Add technical details to prompts
                </p>
              </div>
            </div>
          </div>

          {/* Queue Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Queue Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDelayMs">Min Delay (seconds)</Label>
                <Input
                  id="minDelayMs"
                  type="number"
                  min="2"
                  max="60"
                  value={formData.minDelayMs / 1000}
                  onChange={(e) => handleChange('minDelayMs', (parseInt(e.target.value) || 2) * 1000)}
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
                  onChange={(e) => handleChange('maxDelayMs', (parseInt(e.target.value) || 5) * 1000)}
                  disabled={loading}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Random delay between {formData.minDelayMs / 1000}-{formData.maxDelayMs / 1000} seconds helps avoid bot detection
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-md">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
