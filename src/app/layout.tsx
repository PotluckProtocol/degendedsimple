import type { Metadata } from "next";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import { client } from "./client";

export const metadata: Metadata = {
  title: "DEGENDED MARKETS",
  description: "Decentralized prediction markets on Sonic. Bet on future outcomes with blockchain transparency.",
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
