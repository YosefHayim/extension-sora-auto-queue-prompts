import type {
  CSVRow,
  AspectRatio,
  PresetType,
  GeneratedPrompt,
} from "../types";

export interface CSVParseResult {
  rows: CSVRow[];
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
          const rows = this.parseContent(content);

          if (rows.length === 0) {
            resolve({
              rows: [],
              success: false,
              error: "No valid prompts found in CSV file",
            });
            return;
          }

          resolve({
            rows,
            success: true,
          });
        } catch (error) {
          resolve({
            rows: [],
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to parse CSV",
          });
        }
      };

      reader.onerror = () => {
        resolve({
          rows: [],
          success: false,
          error: "Failed to read file",
        });
      };

      reader.readAsText(file);
    });
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  static parseContent(content: string): CSVRow[] {
    const lines = content.split("\n");
    const rows: CSVRow[] = [];
    let isFirstLine = true;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // Skip header row
      if (isFirstLine && trimmed.toLowerCase().includes("prompt")) {
        isFirstLine = false;
        continue;
      }

      isFirstLine = false;

      const columns = this.parseCSVLine(trimmed);

      // Column 0: Prompt (required)
      const prompt = columns[0]
        ?.replace(/^"|"$/g, "")
        .replace(/""/g, '"')
        .trim();
      if (!prompt) {
        continue;
      }

      const row: CSVRow = { prompt };

      // Column 1: Type (optional - video or image)
      if (columns[1]) {
        const type = columns[1].toLowerCase().trim();
        if (type === "video" || type === "image") {
          row.type = type;
        }
      }

      // Column 2: Aspect Ratio (optional)
      if (columns[2]) {
        const aspectRatio = columns[2].trim() as AspectRatio;
        const validRatios: AspectRatio[] = [
          "16:9",
          "9:16",
          "1:1",
          "4:3",
          "3:4",
          "21:9",
        ];
        if (validRatios.includes(aspectRatio)) {
          row.aspectRatio = aspectRatio;
        }
      }

      // Column 3: Variations (optional - number)
      if (columns[3]) {
        const variations = parseInt(columns[3].trim(), 10);
        if (!isNaN(variations) && variations > 0 && variations <= 10) {
          row.variations = variations;
        }
      }

      // Column 4: Preset (optional)
      if (columns[4]) {
        const preset = columns[4].toLowerCase().trim() as PresetType;
        const validPresets: PresetType[] = [
          "cinematic",
          "documentary",
          "artistic",
          "realistic",
          "animated",
          "none",
        ];
        if (validPresets.includes(preset)) {
          row.preset = preset;
        }
      }

      rows.push(row);
    }

    return rows;
  }

  static exportToCSV(prompts: GeneratedPrompt[]): string {
    const header = "prompt,type,aspect_ratio,variations,preset\n";
    const rows = prompts
      .map((p) => {
        const fields = [
          `"${p.text.replace(/"/g, '""')}"`,
          p.mediaType || "",
          p.aspectRatio || "",
          p.variations?.toString() || "",
          p.preset || "",
        ];
        return fields.join(",");
      })
      .join("\n");
    return header + rows;
  }

  static downloadCSV(
    prompts: GeneratedPrompt[],
    filename: string = "prompts.csv",
  ): void {
    const csv = this.exportToCSV(prompts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadTemplate(filename: string = "prompts-template.csv"): void {
    const template = `prompt,type,aspect_ratio,variations,preset
"A cinematic shot of underwater coral reef",video,16:9,4,cinematic
"Portrait of a woman in golden hour light",image,4:3,2,realistic
"Animated character walking through forest",video,16:9,4,animated`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
