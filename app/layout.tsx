// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Providers from '@/components/Providers'; // your existing one (SessionProvider + QueryClient)
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: {
    default: 'ChainTogether - Build Habits Together',
    template: '%s | ChainTogether',
  },
  description: 'Real accountability with friends. Track streaks, send nudges, and stay consistent together. Made in Ethiopia.',
  keywords: ['habit tracker', 'accountability', 'streaks', 'friends', 'productivity', 'Ethiopia'],
  authors: [{ name: 'Biniyam', url: 'https://github.com/yourusername' }],
  openGraph: {
    title: 'ChainTogether - Habits That Stick With Friends',
    description: 'The social habit tracker that actually works.',
    url: 'https://chain-together.vercel.app',
    siteName: 'ChainTogether',
    images: [
      {
        url: '/og-image.jpg', // add this image to /public later
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChainTogether',
    description: 'Build habits together with real accountability.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Optional: Add Pusher or other CDN scripts here if needed */}
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Providers session={session}>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}