// app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Providers from '@/components/Providers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChainTogether - Build Habits Together',
  description: 'Real accountability with friends. Track streaks, send nudges, and stay consistent together. Made in Ethiopia.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ChainTogether - Habits That Stick With Friends',
    description: 'The social habit tracker that actually works. Share streaks, get nudges, and build unbreakable habits together.',
    images: [
      {
        url: 'https://chain-together.vercel.app/og-image.jpg', // replace with your real image later
        width: 1200,
        height: 630,
        alt: 'ChainTogether',
      },
    ],
    siteName: 'ChainTogether',
    locale: 'en_ET',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChainTogether - Build Habits Together',
    description: 'Real accountability with friends.',
  },
  keywords: ['habit tracker', 'accountability', 'streaks', 'friends', 'Ethiopia', 'productivity'],
  authors: [{ name: 'Biniyam', url: 'https://yourwebsite.com' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}