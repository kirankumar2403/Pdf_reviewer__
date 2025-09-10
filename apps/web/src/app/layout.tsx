import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FileText } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDF Reviewer',
  description: 'Professional PDF Invoice Review and Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PDF Reviewer
                </h1>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium ml-2">
                  Professional
                </span>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
