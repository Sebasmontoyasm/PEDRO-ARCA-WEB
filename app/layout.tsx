import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "Clínica de Fracturas",
  description: "Dashboard clínica de fracturas",
  generator: "Solutions-Systems",
  icons: {
    icon: "/favicon/bone.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`min-h-screen bg-slate-950 text-gray-100 antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
