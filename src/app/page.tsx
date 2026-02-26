"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { FilterBar } from "@/components/FilterBar";
import { HolidayCalendar } from "@/components/HolidayCalendar";
import { HolidayList } from "@/components/HolidayList";
import { SubscribeSection } from "@/components/SubscribeSection";
import { holidays2026 } from "@/data/holidays";
import { Country } from "@/types";
import { GitBranch } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations("common");
  const tCountries = useTranslations("countries");
  const tHome = useTranslations("home");
  const tFooter = useTranslations("footer");

  const [countryFilter, setCountryFilter] = React.useState<Country>(() => {
    const country = searchParams.get("country");
    if (
      country === "AL" ||
      country === "XK" ||
      country === "ME" ||
      country === "MK" ||
      country === "BOTH"
    ) {
      return country as Country;
    }
    return "BOTH";
  });

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

    if (countryFilter === "BOTH") {
      params.delete("country");
    } else {
      params.set("country", countryFilter);
    }

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
      <main className="container mx-auto px-0 sm:px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-start text-left mb-12 space-y-6 px-4 sm:px-0">
            <span className="px-4 py-1.5 rounded-full border border-border text-muted-foreground text-sm font-medium">
              {tCommon("year")}
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              {tHome("title")}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                {tCountries("AL")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                {tCountries("XK")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                {tCountries("ME")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                {tCountries("MK")}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <span className="w-2.5 h-2.5 rounded-l-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-r-full bg-blue-500"></span>
                </div>
                {tCountries("BOTH")}
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
          </div>

          <FilterBar
            countryFilter={countryFilter}
            view={view}
            onCountryChange={setCountryFilter}
            onViewChange={setView}
          />

          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {view === "CALENDAR" ? (
              <HolidayCalendar
                holidays={holidays2026}
                countryFilter={countryFilter}
              />
            ) : (
              <HolidayList
                holidays={holidays2026}
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

      <footer className="border-t border-border mt-12 py-8 text-center text-sm text-muted-foreground px-4">
        <div className="flex flex-col items-center gap-4">
          {/* <SubscribeSection /> */}
          <p>{tFooter("copyright")}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <a
              href="https://www.bankofalbania.org/Shtypi/Kalendari_i_festave_zyrtare_2026/"
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
          <p className="text-xs text-muted-foreground/60">{tFooter("updated")}</p>
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
