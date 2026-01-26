import * as React from "react";
import { LuX, LuCheck } from "react-icons/lu";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

export type BulkInputType = "text" | "textarea" | "select" | "search-replace";

export interface SelectOption {
  value: string;
  label: string;
}

export interface BulkInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string | { search: string; replace: string }) => void;
  title: string;
  description?: string;
  inputType: BulkInputType;
  inputLabel: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
  options?: SelectOption[];
  icon?: React.ReactNode;
  selectedCount?: number;
}

export function BulkInputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  inputType,
  inputLabel,
  inputPlaceholder,
  confirmLabel = "Apply",
  options = [],
  icon,
  selectedCount,
}: BulkInputDialogProps) {
  const [value, setValue] = React.useState("");
  const [searchValue, setSearchValue] = React.useState("");
  const [replaceValue, setReplaceValue] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setValue("");
      setSearchValue("");
      setReplaceValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValid =
    inputType === "search-replace"
      ? searchValue.length > 0
      : value.length > 0 || (inputType === "select" && options.length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    if (inputType === "search-replace") {
      onConfirm({ search: searchValue, replace: replaceValue });
    } else {
      onConfirm(value);
    }
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (isValid) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-[400px] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <LuX className="h-4 w-4" />
          </Button>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {selectedCount !== undefined && (
          <p className="text-xs text-muted-foreground">
            Applying to {selectedCount} selected prompt
            {selectedCount !== 1 ? "s" : ""}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputType === "text" && (
            <div className="space-y-2">
              <Label htmlFor="bulk-input">{inputLabel}</Label>
              <Input
                id="bulk-input"
                placeholder={inputPlaceholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}

          {inputType === "textarea" && (
            <div className="space-y-2">
              <Label htmlFor="bulk-textarea">{inputLabel}</Label>
              <Textarea
                id="bulk-textarea"
                placeholder={inputPlaceholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none h-32"
                autoFocus
              />
            </div>
          )}

          {inputType === "select" && (
            <div className="space-y-2">
              <Label>{inputLabel}</Label>
              <div className="space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue(option.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                      value === option.value
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {value === option.value && (
                      <LuCheck className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span className={value !== option.value ? "ml-5.5" : ""}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputType === "search-replace" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-input">Search for</Label>
                <Input
                  id="search-input"
                  placeholder="Text to find..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replace-input">Replace with</Label>
                <Input
                  id="replace-input"
                  placeholder="Replacement text (empty to delete)"
                  value={replaceValue}
                  onChange={(e) => setReplaceValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={!isValid}>
              <LuCheck className="h-4 w-4 mr-2" />
              {confirmLabel}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
