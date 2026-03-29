import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VentureMind",
  description: "AI-Native VC Project Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:underline"
          >
            Skip to main content
          </a>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
