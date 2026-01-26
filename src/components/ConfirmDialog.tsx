import * as React from "react";
import { LuX, LuTriangleAlert, LuInfo } from "react-icons/lu";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export type ConfirmDialogVariant = "destructive" | "warning" | "info";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  icon,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  const variantStyles = {
    destructive: {
      iconColor: "text-destructive",
      buttonVariant: "destructive" as const,
      defaultIcon: <LuTriangleAlert className="h-5 w-5" />,
    },
    warning: {
      iconColor: "text-amber-500",
      buttonVariant: "default" as const,
      defaultIcon: <LuTriangleAlert className="h-5 w-5" />,
    },
    info: {
      iconColor: "text-blue-500",
      buttonVariant: "default" as const,
      defaultIcon: <LuInfo className="h-5 w-5" />,
    },
  };

  const styles = variantStyles[variant];

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
          <div className="flex items-center gap-3">
            <span className={styles.iconColor}>
              {icon || styles.defaultIcon}
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <LuX className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex gap-2 pt-2">
          <Button
            variant={styles.buttonVariant}
            className="flex-1"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  variant = "info",
  icon,
}: AlertDialogProps) {
  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const variantStyles = {
    destructive: {
      iconColor: "text-destructive",
      defaultIcon: <LuTriangleAlert className="h-5 w-5" />,
    },
    warning: {
      iconColor: "text-amber-500",
      defaultIcon: <LuTriangleAlert className="h-5 w-5" />,
    },
    info: {
      iconColor: "text-blue-500",
      defaultIcon: <LuInfo className="h-5 w-5" />,
    },
  };

  const styles = variantStyles[variant];

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
          <div className="flex items-center gap-3">
            <span className={styles.iconColor}>
              {icon || styles.defaultIcon}
            </span>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <LuX className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            OK
          </Button>
        </div>
      </Card>
    </div>
  );
}
