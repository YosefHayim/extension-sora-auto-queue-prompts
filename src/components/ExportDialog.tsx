import * as React from "react";
import { FaDownload, FaTimes, FaFileAlt, FaFileExcel } from "react-icons/fa";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import type { GeneratedPrompt } from "../types"
import { log } from "../utils/logger";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: GeneratedPrompt[];
}

export function ExportDialog({ isOpen, onClose, prompts }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = React.useState<"json" | "csv" | "txt">("csv");

  if (!isOpen) return null;

  const exportToJSON = () => {
    const dataStr = JSON.stringify(prompts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sora-prompts-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    log.ui.action("ExportDialog:JSON", { count: prompts.length });
    onClose();
  };

  const exportToCSV = () => {
    const headers = ["ID", "Text", "Status", "Media Type", "Aspect Ratio", "Variations", "Preset", "Timestamp", "Enhanced"];
    const rows = prompts.map((p) => [
      p.id,
      `"${p.text.replace(/"/g, '""')}"`, // Escape quotes for CSV
      p.status,
      p.mediaType,
      p.aspectRatio || "",
      p.variations?.toString() || "",
      p.preset || "",
      new Date(p.timestamp).toISOString(),
      p.enhanced ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sora-prompts-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    log.ui.action("ExportDialog:CSV", { count: prompts.length });
    onClose();
  };

  const exportToTXT = () => {
    const content = prompts.map((p, index) => `${index + 1}. ${p.text}\n   Status: ${p.status} | Type: ${p.mediaType}${p.aspectRatio ? ` | Aspect: ${p.aspectRatio}` : ""}`).join("\n\n");
    const dataBlob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sora-prompts-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    log.ui.action("ExportDialog:TXT", { count: prompts.length });
    onClose();
  };

  const handleExport = () => {
    switch (exportFormat) {
      case "json":
        exportToJSON();
        break;
      case "csv":
        exportToCSV();
        break;
      case "txt":
        exportToTXT();
        break;
    }
  };

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <Card className="w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaDownload className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Export Prompts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`
                  flex flex-col items-center gap-2 p-4 border rounded-lg transition-all
                  ${exportFormat === "csv" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
              >
                <FaFileExcel className="h-5 w-5" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("json")}
                className={`
                  flex flex-col items-center gap-2 p-4 border rounded-lg transition-all
                  ${exportFormat === "json" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
              >
                <FaFileAlt className="h-5 w-5" />
                <span className="text-sm font-medium">JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("txt")}
                className={`
                  flex flex-col items-center gap-2 p-4 border rounded-lg transition-all
                  ${exportFormat === "txt" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                `}
              >
                <FaFileAlt className="h-5 w-5" />
                <span className="text-sm font-medium">TXT</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Exporting <strong>{prompts.length}</strong> prompt{prompts.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExport} className="flex-1">
              <FaDownload className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

