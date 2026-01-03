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
  title: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
  description: "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026. Planifikoni pushimet tuaja me lehtësi.",
  keywords: ["festat zyrtare", "festat zyrtare 2026", "kalendari 2026", "pushime Shqiperi", "pushime Kosove", "ditet e pushimit", "kalendari i festave"],
  authors: [{ name: "Festat Zyrtare" }],
  creator: "Festat Zyrtare",
  publisher: "Festat Zyrtare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://festazyrtare.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
    description: "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026.",
    url: 'https://festazyrtare.com',
    siteName: 'Festat Zyrtare',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Festat Zyrtare 2026',
      },
    ],
    locale: 'sq_AL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Festat Zyrtare 2026 - Shqipëri & Kosovë",
    description: "Kalendari i plotë i festave zyrtare për Shqipërinë dhe Kosovën për vitin 2026.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
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
