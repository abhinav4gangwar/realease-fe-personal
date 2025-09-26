import { Toaster } from '@/components/ui/sonner'
import { SearchProvider } from '@/providers/doc-search-context'
import { PropertySearchProvider } from '@/providers/property-search-context'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'RealEase - Modern Real Estate Management',
    template: '%s | RealEase',
  },
  description:
    'Streamline your real estate business with modern tools for property management, client relationships, and analytics.',
  keywords: ['real estate', 'property management', 'CRM', 'analytics'],
  authors: [{ name: 'RealEase Team' }],
  creator: 'RealEase',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'RealEase - Modern Real Estate Management',
    description:
      'Streamline your real estate business with modern tools for property management, client relationships, and analytics.',
    siteName: 'RealEase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RealEase - Modern Real Estate Management',
    description:
      'Streamline your real estate business with modern tools for property management, client relationships, and analytics.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          src="https://www.google.com/recaptcha/enterprise.js?render=6Lei03QrAAAAAEK0pH527CXk4N52EtzbbSQ6bc0Z"
          async
        />
      </head>
      <body className="bg-gray-50 font-sans text-gray-900 antialiased">
        <div id="root">
          <SearchProvider>
            <PropertySearchProvider>
              {children}
              <Toaster />
            </PropertySearchProvider>
          </SearchProvider>
        </div>
      </body>
    </html>
  )
}
