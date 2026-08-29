import './globals.css'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sentinel Control Tower',
  description: 'The live AI Control Plane for performance, cost, and responsibility.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30`}>
        {children}
      </body>
    </html>
  )
}
