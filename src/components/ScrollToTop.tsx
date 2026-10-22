"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function ScrollToTop() {
  const t = useTranslations("common");
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-colors hover:bg-secondary cursor-pointer"
      aria-label={t("backToTop")}
      title={t("backToTop")}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
