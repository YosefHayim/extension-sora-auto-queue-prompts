export interface CSVParseResult {
  prompts: string[];
  success: boolean;
  error?: string;
}

export class CSVParser {
  static parseFile(file: File): Promise<CSVParseResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const prompts = this.parseContent(content);

          if (prompts.length === 0) {
            resolve({
              prompts: [],
              success: false,
              error: 'No valid prompts found in CSV file',
            });
            return;
          }

          resolve({
            prompts,
            success: true,
          });
        } catch (error) {
          resolve({
            prompts: [],
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse CSV',
          });
        }
      };

      reader.onerror = () => {
        resolve({
          prompts: [],
          success: false,
          error: 'Failed to read file',
        });
      };

      reader.readAsText(file);
    });
  }

  static parseContent(content: string): string[] {
    const lines = content.split('\n');
    const prompts: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and header-like rows
      if (!trimmed || trimmed.toLowerCase().startsWith('prompt')) {
        continue;
      }

      // Handle CSV with quotes
      const cleanedPrompt = trimmed
        .replace(/^"|"$/g, '') // Remove surrounding quotes
        .replace(/""/g, '"')   // Unescape double quotes
        .trim();

      if (cleanedPrompt.length > 0) {
        prompts.push(cleanedPrompt);
      }
    }

    return prompts;
  }

  static exportToCSV(prompts: string[]): string {
    const header = 'prompt\n';
    const rows = prompts.map((p) => `"${p.replace(/"/g, '""')}"`).join('\n');
    return header + rows;
  }

  static downloadCSV(prompts: string[], filename: string = 'prompts.csv'): void {
    const csv = this.exportToCSV(prompts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
