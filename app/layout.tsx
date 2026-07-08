import { Analytics } from '@vercel/analytics/next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'ReconForge — Bug Bounty & VAPT Platform',
  description:
    'Automated Bug Bounty and VAPT platform with 15-phase active/passive scanning pipeline, CVSS v3.1 calculator, Impact Matrix scoring, vulnerability triage, and full reporting.',
  keywords: ['bug bounty', 'VAPT', 'penetration testing', 'recon', 'vulnerability scanner', 'security', 'CVSS', 'impact matrix'],
  robots: { index: false, follow: false }, // Do not index — security tooling
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0b0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-[#0a0b0f]`}>
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
