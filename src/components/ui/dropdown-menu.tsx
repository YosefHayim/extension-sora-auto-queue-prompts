import * as React from "react";
import { cn } from "../../lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext =
  React.createContext<DropdownMenuContextValue | null>(null);

const DropdownMenu = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    // Use setTimeout to avoid immediate closure on trigger click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div
        ref={containerRef}
        className={cn(
          "relative text-left",
          className?.includes("w-full") ? "block" : "inline-block",
          className,
        )}
      >
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    context.setOpen(!context.open);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={handleClick}
      aria-expanded={context.open}
      aria-haspopup="true"
      {...props}
    >
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }
>(({ className, align = "start", ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error("DropdownMenuContent must be used within DropdownMenu");

  if (!context.open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-[110] min-w-[8rem] overflow-hidden rounded-xl border bg-card p-1 text-card-foreground shadow-md",
        align === "end" ? "right-0" : "left-0",
        "mt-2",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    />
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onSelect?: () => void }
>(({ className, onClick, onSelect, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error("DropdownMenuItem must be used within DropdownMenu");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
    onSelect?.();
    context.setOpen(false);
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2 text-[13px] outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
