import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Opyjo Adaptive Engine | Canadian Learning Intelligence",
  description:
    "Ontario-first adaptive learning infrastructure for Canadian education platforms and publishers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
