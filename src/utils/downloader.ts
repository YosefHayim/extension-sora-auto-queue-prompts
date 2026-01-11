/**
 * Download utility for auto-downloading generated media from Sora
 * Uses Chrome's downloads API to save files to the user's Downloads folder
 */

export interface DownloadOptions {
  url: string;
  promptText: string;
  mediaType: "video" | "image";
  subfolder: string;
  promptSaveLocation: boolean;
  timestamp?: number;
}

export interface DownloadResult {
  success: boolean;
  downloadId?: number;
  filename?: string;
  error?: string;
}

export interface ExtractedMedia {
  url: string;
  mediaType: "video" | "image";
}

class Downloader {
  /**
   * Sanitize prompt text for use as filename
   * - Remove special characters that are invalid in filenames
   * - Truncate to reasonable length (50 chars)
   * - Replace spaces with underscores
   */
  private sanitizeFilename(text: string): string {
    return (
      text
        // Remove or replace characters invalid in filenames
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
        // Replace multiple spaces/newlines with single underscore
        .replace(/[\s\n\r]+/g, "_")
        // Remove leading/trailing underscores
        .replace(/^_+|_+$/g, "")
        // Truncate to 50 characters
        .substring(0, 50)
        // Remove trailing underscore after truncation
        .replace(/_+$/, "") || "sora_generated"
    );
  }

  /**
   * Get file extension based on media type and URL
   */
  private getExtension(url: string, mediaType: "video" | "image"): string {
    // Try to extract extension from URL
    const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (urlMatch) {
      const ext = urlMatch[1].toLowerCase();
      // Validate it's a reasonable extension
      if (["mp4", "webm", "mov", "png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
        return ext;
      }
    }

    // Default extensions based on media type
    return mediaType === "video" ? "mp4" : "png";
  }

  /**
   * Generate filename with format:
   * {sanitized_prompt}_{timestamp}.{extension}
   */
  private generateFilename(options: DownloadOptions): string {
    const sanitized = this.sanitizeFilename(options.promptText);
    const timestamp = options.timestamp || Date.now();
    const extension = this.getExtension(options.url, options.mediaType);

    return `${sanitized}_${timestamp}.${extension}`;
  }

  /**
   * Build the full file path including subfolder
   */
  private buildFilepath(filename: string, subfolder: string): string {
    // Clean up subfolder - remove leading/trailing slashes and invalid chars
    const cleanSubfolder = subfolder
      .replace(/^[/\\]+|[/\\]+$/g, "")
      .replace(/[<>:"|?*\x00-\x1f]/g, "");

    if (cleanSubfolder) {
      return `${cleanSubfolder}/${filename}`;
    }
    return filename;
  }

  /**
   * Download a single media file
   * Uses chrome.downloads.download() API
   */
  async downloadMedia(options: DownloadOptions): Promise<DownloadResult> {
    try {
      const filename = this.generateFilename(options);
      const filepath = this.buildFilepath(filename, options.subfolder);

      const downloadId = await chrome.downloads.download({
        url: options.url,
        filename: filepath,
        saveAs: options.promptSaveLocation,
        conflictAction: "uniquify", // Auto-rename if file exists
      });

      return {
        success: true,
        downloadId,
        filename: filepath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Download all media from a completed generation
   */
  async downloadAllMedia(
    mediaUrls: ExtractedMedia[],
    promptText: string,
    subfolder: string,
    promptSaveLocation: boolean
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];
    const baseTimestamp = Date.now();

    for (let i = 0; i < mediaUrls.length; i++) {
      const media = mediaUrls[i];
      // Add index to timestamp to ensure unique filenames for multiple files
      const timestamp = baseTimestamp + i;

      const result = await this.downloadMedia({
        url: media.url,
        promptText,
        mediaType: media.mediaType,
        subfolder,
        promptSaveLocation,
        timestamp,
      });

      results.push(result);

      // Small delay between downloads to avoid overwhelming the browser
      if (i < mediaUrls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

export const downloader = new Downloader();
