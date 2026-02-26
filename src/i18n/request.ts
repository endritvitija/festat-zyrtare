import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_HEADER = "x-next-intl-locale";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (requested && hasLocale(routing.locales, requested)) {
    return {
      locale: requested,
      messages: (await import(`../../messages/${requested}.json`)).default,
    };
  }
  const headersList = await headers();
  const headerLocale = headersList.get(LOCALE_HEADER);
  if (headerLocale && hasLocale(routing.locales, headerLocale)) {
    return {
      locale: headerLocale,
      messages: (await import(`../../messages/${headerLocale}.json`)).default,
    };
  }
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = hasLocale(routing.locales, cookieLocale)
    ? cookieLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
