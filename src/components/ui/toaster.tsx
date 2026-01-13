import * as React from "react";

import { Toast } from "./toast";
import { cn } from "../../lib/utils";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  const visibleToasts = toasts.filter((toast) => toast.open !== false);

  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none",
      )}
    >
      {visibleToasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => {
            dismiss(toast.id);
          }}
        />
      ))}
    </div>
  );
}
