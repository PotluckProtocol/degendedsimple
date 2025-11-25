import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "DEGENDED MARKETS",
  description: "Decentralized prediction markets on Sonic. Bet on future outcomes with blockchain transparency.",
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: "DEGENDED MARKETS",
    description: "Decentralized prediction markets on Sonic. Bet on future outcomes with blockchain transparency.",
    url: "https://degendedmarkets.com",
    siteName: "DEGENDED MARKETS",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 1200,
        alt: 'DEGENDED MARKETS - Decentralized Prediction Markets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "DEGENDED MARKETS",
    description: "Decentralized prediction markets on Sonic. Bet on future outcomes with blockchain transparency.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
        <Toaster />
      </body>
    </html>
  );
}
