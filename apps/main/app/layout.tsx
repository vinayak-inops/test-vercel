import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Provider from "@repo/ui/components/providers";
import SessionProvider from "./components/providers/SessionProvider";
import { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "INOPS Platform",
  description: "INOPS Workforce Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#f3f4f8]">
        <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <SessionProvider>
              <Provider>
                <main className="min-h-screen">{children}</main>
              </Provider>
            </SessionProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}