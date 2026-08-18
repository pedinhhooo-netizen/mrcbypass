import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MRC',
  description: 'Remote MRC V3 Bypass — no logs. no traces. no cheat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
