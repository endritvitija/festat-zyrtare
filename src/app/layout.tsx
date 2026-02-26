import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleScript } from "@/components/LocaleScript";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("title");
  const description = t("description");
  const siteName = t("siteName");
  const template = t("titleTemplate");
  return {
    metadataBase: new URL("https://festazyrtare.com"),
    title: { default: title, template },
    description,
    keywords: [
      "festat zyrtare",
      "festat zyrtare 2026",
      "kalendari 2026",
      "pushime Shqiperi",
      "pushime Kosove",
      "Albania holidays",
      "Kosovo holidays",
    ],
    robots: { index: true, follow: true },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      url: "https://festazyrtare.com",
      title,
      description,
      siteName,
      locale: locale === "sq" ? "sq_AL" : locale === "de" ? "de_DE" : "en",
    },
    twitter: { title, description },
    alternates: { canonical: "https://festazyrtare.com" },
    applicationName: siteName,
    appleWebApp: { title: siteName },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ef4444" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <LocaleScript locale={locale} />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
