"use client";

import * as React from "react";
import { format, addMonths } from "date-fns";
import { sq, enUS, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";

const dateFnsLocaleMap = { sq, en: enUS, de } as const;

/** Same-origin API route to avoid CORS; server proxies to Firebase Cloud Function */
const SUBSCRIBE_API_PATH = "api-finory-dev.firebaseapp.com/api/subscribe";

type Status = "idle" | "loading" | "success" | "error";

export function SubscribeSection() {
  const locale = useLocale() as "sq" | "en" | "de";
  const t = useTranslations("footer");
  const dateFnsLocale = dateFnsLocaleMap[locale] ?? enUS;

  const now = new Date();
  const nextMonth = addMonths(now, 1);
  const monthName = format(nextMonth, "MMMM", { locale: dateFnsLocale });
  const month = nextMonth.getMonth() + 1;
  const year = nextMonth.getFullYear();

  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(SUBSCRIBE_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, month, year }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = text || `HTTP ${res.status}`;
        try {
          const json = JSON.parse(text) as { error?: string };
          if (json.error) msg = json.error;
        } catch {
          /* use msg as-is */
        }
        throw new Error(msg);
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : t("subscribeError"));
    }
  };

  return (
    <section className="w-full max-w-md mx-auto mb-8">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {t("subscribeTitle")}
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        {t("subscribeDescription")}
      </p>
      {status === "success" ? (
        <p className="text-sm text-green-600 dark:text-green-400">
          {t("subscribeSuccess", { month: monthName })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("subscribePlaceholder")}
              disabled={status === "loading"}
              required
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
              aria-label={t("subscribePlaceholder")}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-10 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            {status === "loading" ? "..." : t("subscribeButton")}
          </button>
        </form>
      )}
      {status === "error" && errorMessage && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </section>
  );
}
