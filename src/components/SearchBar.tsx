import { LuSearch } from "react-icons/lu";
import { cn } from "../lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search prompts...",
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg bg-muted px-3",
        className,
      )}
    >
      <LuSearch className="h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}
