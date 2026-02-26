"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LNG_PARAM = "lng";

const locales = [
  { code: "sq" as const, label: "Shqip" },
  { code: "en" as const, label: "English" },
  { code: "de" as const, label: "Deutsch" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale() as "sq" | "en" | "de";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentLabel = locales.find((l) => l.code === locale)?.label ?? locale;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newLocale: "sq" | "en" | "de") => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set(LNG_PARAM, newLocale);
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    setIsOpen(false);
    startTransition(() => {
      router.replace(url);
      router.refresh(); // refetch layout so locale/messages update without full reload
    });
  };

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium",
          "bg-secondary/50 hover:bg-secondary text-foreground transition-all border border-transparent hover:border-border",
          "min-w-[100px] sm:min-w-[110px]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-full min-w-[140px] rounded-md shadow-lg bg-popover border border-border z-50 py-1 animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          {locales.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              onClick={() => handleSelect(code)}
              className={cn(
                "flex items-center w-full text-left px-3 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors",
                locale === code && "bg-muted/50 font-medium"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
