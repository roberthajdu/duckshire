import type { Metadata, Viewport } from "next";
import { Archivo, Zilla_Slab } from "next/font/google";
import "./globals.css";

// The schedule's workhorse grotesque; the width axis gives condensed caps for labels.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// The printer's slab for names: the Duck, its Action, the masthead.
const zillaSlab = Zilla_Slab({
  variable: "--font-zilla",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Duckshire",
  description: "Name a duck. Watch it forage. Become unreasonably proud of it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16231b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${zillaSlab.variable}`}>
      <body>{children}</body>
    </html>
  );
}
