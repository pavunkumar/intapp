import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// TASA Orbiter (variable, 400–800), the typeface used in the design.
const tasa = localFont({
  src: "./fonts/TASAOrbiter-latin.woff2",
  weight: "400 800",
  variable: "--font-tasa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indian Nifty Trader | Learn Stock Market Trading",
  description:
    "Master intraday trading, technical analysis, options selling, and long-term wealth building with India's practical trading curriculum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={tasa.variable}>
      <body className="bg-ink font-sans text-white antialiased">{children}</body>
    </html>
  );
}
