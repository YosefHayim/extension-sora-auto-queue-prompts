import React from "react";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onCheckedChange, disabled = false, className = "" }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={`
          w-11 h-6 rounded-full p-0.5
          transition-colors duration-200
          ${checked ? "bg-primary" : "bg-muted"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      >
        <div
          className={`
            w-5 h-5 rounded-full bg-white
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    );
  },
);

Toggle.displayName = "Toggle";
