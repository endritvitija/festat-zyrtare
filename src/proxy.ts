import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "NEXT_LOCALE";
const LOCALE_HEADER = "x-next-intl-locale";
const LNG_PARAM = "lng";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const lng = url.searchParams.get(LNG_PARAM);
  const response =
    lng === "sq" || lng === "en" || lng === "de"
      ? (() => {
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set(LOCALE_HEADER, lng);
          const res = NextResponse.next({ request: { headers: requestHeaders } });
          res.cookies.set(LOCALE_COOKIE, lng, { path: "/", maxAge: 60 * 60 * 24 * 365 });
          return res;
        })()
      : NextResponse.next();
  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
