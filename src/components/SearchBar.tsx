import { Input } from "./ui/input";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Button } from "./ui/button";
import { cn } from "../lib/utils"

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search prompts...", className }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
          onClick={() => onChange("")}
        >
          <FaTimes className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

