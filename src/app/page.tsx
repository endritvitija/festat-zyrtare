"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FilterBar } from "@/components/FilterBar";
import { HolidayCalendar } from "@/components/HolidayCalendar";
import { HolidayList } from "@/components/HolidayList";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getHolidayYear, getHolidaysForYear } from "@/data/holidays";
import { SingleCountry } from "@/types";
import { GitBranch } from "lucide-react";

const DEFAULT_COUNTRY: SingleCountry = "XK";

const TIMEZONE_TO_COUNTRY: Record<string, SingleCountry> = {
  "Europe/Tirane": "AL",
  "Europe/Podgorica": "ME",
  "Europe/Skopje": "MK",
};

function detectCountryFromTimezone(): SingleCountry | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] ?? null;
  } catch {
    return null;
  }
}

async function detectCountryFromIP(): Promise<SingleCountry | null> {
  try {
    const response = await fetch("https://ipapi.co/country_code/", {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const code = (await response.text()).trim().toUpperCase();
    const supported: Record<string, SingleCountry> = {
      AL: "AL",
      XK: "XK",
      ME: "ME",
      MK: "MK",
    };
    return supported[code] ?? null;
  } catch {
    return null;
  }
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const tHome = useTranslations("home");
  const tFooter = useTranslations("footer");

  const year = getHolidayYear();
  const holidays = React.useMemo(() => getHolidaysForYear(year), [year]);

  const hasCountryParam = searchParams.has("country");

  const [countryFilter, setCountryFilter] = React.useState<SingleCountry>(() => {
    const country = searchParams.get("country");
    if (
      country === "AL" ||
      country === "XK" ||
      country === "ME" ||
      country === "MK"
    ) {
      return country;
    }
    return DEFAULT_COUNTRY;
  });

  React.useEffect(() => {
    if (hasCountryParam) return;

    const tzCountry = detectCountryFromTimezone();
    if (tzCountry) {
      setCountryFilter(tzCountry);
      return;
    }

    detectCountryFromIP().then((ipCountry) => {
      if (ipCountry) setCountryFilter(ipCountry);
    });
  }, [hasCountryParam]);

  const [view, setView] = React.useState<"CALENDAR" | "LIST">(() => {
    const v = searchParams.get("view");
    if (v === "CALENDAR" || v === "LIST") {
      return v as "CALENDAR" | "LIST";
    }
    return "CALENDAR";
  });

  React.useEffect(() => {
    const currentQuery = searchParams.toString();
    const params = new URLSearchParams(currentQuery);

    params.set("country", countryFilter);

    if (view === "CALENDAR") {
      params.delete("view");
    } else {
      params.set("view", view);
    }

    const newQuery = params.toString();
    if (currentQuery !== newQuery) {
      const url = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(url, { scroll: false });
    }
  }, [countryFilter, view, pathname, router, searchParams]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <main className="container mx-auto px-0 sm:px-4 pt-4 pb-8 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 px-4 sm:px-0">
            <div className="flex items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full border border-border text-muted-foreground text-sm font-medium tabular-nums">
                {tCommon("year", { year })}
              </span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {tHome("title")}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 dark:bg-orange-500"></span>
                {tCommon("holiday")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30"></span>
                {tCommon("weekend")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 dark:bg-yellow-600"></span>
                {tCommon("recommendation")}
              </div>
            </div>
          </header>

          <FilterBar
            countryFilter={countryFilter}
            view={view}
            holidays={holidays}
            onCountryChange={setCountryFilter}
            onViewChange={setView}
          />

          <div className="mt-4 sm:mt-6 animate-in fade-in duration-300">
            {view === "CALENDAR" ? (
              <HolidayCalendar
                holidays={holidays}
                year={year}
                countryFilter={countryFilter}
              />
            ) : (
              <HolidayList
                holidays={holidays}
                countryFilter={countryFilter}
              />
            )}
          </div>
          <div className="mt-12 p-4 rounded-lg mx-4 sm:mx-0">
            <p className="text-sm sm:text-base font-medium text-foreground/80 text-center italic">
              {tHome("note")}
            </p>
          </div>
        </div>
      </main>

      <ScrollToTop />

      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground px-4">
        <div className="flex flex-col items-center gap-4">
          {/* <SubscribeSection /> */}
          <p>{tFooter("copyright", { year })}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <a
              href={`https://www.bankofalbania.org/Shtypi/Kalendari_i_festave_zyrtare_${year}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {tFooter("sourceAlbania")}
            </a>
            <a
              href="https://mpb.rks-gov.net/f/86/Kalendari-i-Festave-Zyrtare-"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {tFooter("sourceKosovo")}
            </a>
            <a
              href="https://github.com/endritvitija/festat-zyrtare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <GitBranch className="w-3.5 h-3.5" />
              {tFooter("github")}
            </a>
          </div>
          <p className="text-xs text-muted-foreground/60">
            {tFooter("updated", { year })}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const tCommon = useTranslations("common");

  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            {tCommon("loading")}
          </div>
        </div>
      }
    >
      <HomeContent />
    </React.Suspense>
  );
}
