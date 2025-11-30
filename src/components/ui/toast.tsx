import * as React from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import { cn } from "../../lib/utils";
import type { ToastProps } from "./use-toast";

interface ToastComponentProps extends ToastProps {
  onClose: () => void;
  className?: string;
}

const Toast = React.forwardRef<HTMLLIElement, ToastComponentProps>(
  ({ className, title, description, variant = "default", onClose, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          variant === "default" && "border bg-background text-foreground",
          variant === "destructive" &&
            "border-destructive bg-destructive text-destructive-foreground",
          className
        )}
        {...props}
      >
        <div className="grid gap-1">
          {title && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              {variant === "default" ? (
                <FaCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <FaExclamationCircle className="h-4 w-4" />
              )}
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={onClose}
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </li>
    );
  }
);
Toast.displayName = "Toast";

export { Toast };

