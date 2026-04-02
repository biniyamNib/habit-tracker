// app/layout.tsx
'use client';

import './globals.css';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import Providers from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize OneSignal
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(() => {
      window.OneSignal.init({
        appId: "c36e8562-e566-48e0-9d50-0e9190db047d",   // ← Paste your App ID here
        allowLocalhostAsSecureOrigin: true,     // Important for localhost
        notifyButton: { enable: false },        // We use our own bell
        promptOptions: {
          slidedown: {
            enabled: true,
            autoPrompt: true,
            timeDelay: 8,
            pageViews: 1,
          },
        },
      });
    });
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
          strategy="afterInteractive"
          async
        />
      </head>
      <body>
        <SessionProvider>
          <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}