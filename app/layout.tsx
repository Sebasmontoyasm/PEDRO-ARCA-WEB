import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "sonner";

import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica de Fracturas',
  description: 'Dashboard clÍnica de fracturas',
  generator: 'Solutions-Systems',
  icons: {
    icon: "favicon/bone.svg", // 👈 aquí el nuevo favicon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0f172a", // fondo slate-900
              color: "white",
              border: "1px solid #1e293b", // slate-800
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              padding: "0.75rem 1rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            },
            duration: 3500,
          }}
          richColors={false}
        />
        <Analytics />
      </body>
    </html>
  )
}
