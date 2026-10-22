"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const tTheme = useTranslations("theme");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? tTheme("light") : tTheme("dark");

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground border border-transparent hover:border-border transition-colors cursor-pointer"
      aria-label={label}
      title={label}
    >
      {mounted ? (
        isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
