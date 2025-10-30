import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from "@/components/ui/toaster-provider";
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
          <ToastProvider>
          {children}
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
