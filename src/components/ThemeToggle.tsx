"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted ? theme === "light" : false

  return (
    <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-2 rounded-md transition-all cursor-pointer",
          isLight
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Light theme"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-2 rounded-md transition-all cursor-pointer",
          !isLight
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Dark theme"
      >
        <Moon className="h-5 w-5" />
      </button>
    </div>
  )
}
