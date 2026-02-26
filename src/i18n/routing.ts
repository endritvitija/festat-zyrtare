import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sq", "en", "de"],
  defaultLocale: "sq",
  localePrefix: "never", // use ?lng= query or cookie
});
