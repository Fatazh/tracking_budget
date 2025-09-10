import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Budget Tracker - Kelola Keuangan Anak Kos',
  description: 'Aplikasi untuk mencatat pemasukan dan pengeluaran dengan saldo real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}