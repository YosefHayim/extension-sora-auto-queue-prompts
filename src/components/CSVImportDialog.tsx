import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Upload, FileText, Download, Loader2 } from 'lucide-react';
import { CSVParser } from '../utils/csvParser';
import { log } from '../utils/logger';
import type { GeneratedPrompt, PromptConfig } from '../types';

interface CSVImportDialogProps {
  config: PromptConfig;
  isOpen: boolean;
  onClose: () => void;
  onImport: (prompts: GeneratedPrompt[]) => Promise<void>;
}

export function CSVImportDialog({ config, isOpen, onClose, onImport }: CSVImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      log.ui.action('CSVImportDialog:Import', { fileName: file.name, fileSize: file.size });

      const result = await CSVParser.parseFile(file);

      if (result.success) {
        const newPrompts: GeneratedPrompt[] = result.rows.map((row, index) => ({
          id: `${Date.now()}-${index}`,
          text: row.prompt,
          timestamp: Date.now(),
          status: 'pending' as const,
          mediaType: row.type || config.mediaType || 'video',
          aspectRatio: row.aspectRatio,
          variations: row.variations || config.variationCount || 2,
          preset: row.preset,
        }));

        await onImport(newPrompts);
        setSuccess(`Successfully imported ${newPrompts.length} prompts!`);
        log.ui.action('CSVImportDialog:Success', { count: newPrompts.length });

        // Close dialog after 1.5 seconds
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to parse CSV file');
        log.ui.error('CSVImportDialog:Parse', result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to import CSV';
      setError(errorMsg);
      log.ui.error('CSVImportDialog:Import', err);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleDownloadTemplate() {
    try {
      log.ui.action('CSVImportDialog:DownloadTemplate');
      CSVParser.downloadTemplate();
      setSuccess('Template downloaded!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      log.ui.error('CSVImportDialog:DownloadTemplate', err);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Import CSV</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Import prompts from a CSV file with the following format:</p>
            <div className="bg-muted p-3 rounded-md font-mono text-xs">
              <div>prompt,type,aspect_ratio,variations,preset</div>
              <div className="text-muted-foreground mt-1">
                "A cinematic shot...",video,16:9,4,cinematic
              </div>
            </div>
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleUploadClick}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File
                </>
              )}
            </Button>

            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
