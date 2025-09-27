"use client";

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const value = useMemo(() => ({
    theme,
    setTheme,
    toggle: () => setTheme((t) => {
      if (t === "light") {
        document.documentElement.classList.add("dark");
        return "dark";
      }
      document.documentElement.classList.remove("dark");
      return "light";
    })
  }), [theme]);

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}
