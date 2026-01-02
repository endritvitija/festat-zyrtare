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
  title: "Festat Zyrtare - Shqipëri & Kosovë",
  description: "Kalendari i festave zyrtare për Shqipërinë dhe Kosovën.",
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
