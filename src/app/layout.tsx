import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Makes the browser chrome / status bar match the app's dark background
export const viewport: Viewport = {
  themeColor: '#09090b',         // zinc-950
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',          // extend behind iPhone notch / Dynamic Island
};

export const metadata: Metadata = {
  title: "Purdue Orthodox Lent Menu",
  description: "Filter Purdue University dining menus for Orthodox Lenten fasting restrictions",
  other: {
    // Allows adding to home screen on iOS as a full-screen app
    'apple-mobile-web-app-capable': 'yes',
    // black-translucent: content extends behind the status bar (pairs with viewportFit=cover)
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
