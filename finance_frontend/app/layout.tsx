import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { AuthGuard } from "@/components/auth-guard"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Finflow - AI Personal Finance",
  description:"AI-powered personal finance platform",
  icons: {
    "icon": "/favicon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f0f14" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
        <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthProvider>
              <AuthGuard>{children}</AuthGuard>
            </AuthProvider>
          </ThemeProvider>
          <Analytics/>
        </body>
      </html>
  )
}
