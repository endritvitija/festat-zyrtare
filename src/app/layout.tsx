import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://festazyrtare.com"),
  title: {
    default: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
    template: "%s | Festat Zyrtare",
  },
  description:
    "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026. Planifikoni pushimet tuaja me lehtësi.",
  keywords: [
    "festat zyrtare",
    "festat zyrtare 2026",
    "kalendari 2026",
    "pushime Shqiperi",
    "pushime Kosove",
    "ditet e pushimit",
    "kalendari i festave",
    "Albania holidays",
    "Kosovo holidays",
    "pushimet 2026",
  ],
  creator: "Festat Zyrtare",
  publisher: "Festat Zyrtare",
  authors: [{ name: "Festat Zyrtare", url: "https://festazyrtare.com" }],
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: "https://festazyrtare.com",
    title: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
    description:
      "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026. Planifikoni pushimet tuaja me lehtësi.",
    siteName: "Festat Zyrtare",
    images: [
      {
        url: "https://festazyrtare.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
      },
    ],
    locale: "sq_AL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
    description:
      "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026.",
    images: ["https://festazyrtare.com/og-image.png"],
  },
  alternates: {
    canonical: "https://festazyrtare.com",
  },
  category: "Calendar, Holidays, Albania, Kosovo",
  applicationName: "Festat Zyrtare",
  referrer: "origin-when-cross-origin",
  appleWebApp: {
    title: "Festat Zyrtare",
    statusBarStyle: "default",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ef4444" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
