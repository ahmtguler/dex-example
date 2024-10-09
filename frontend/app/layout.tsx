import type { Metadata } from "next";
import { headers } from 'next/headers'
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import {Providers} from '@/context'
import Header from "@/components/header/header"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "DEX Example",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers cookie={headers().get('cookie') ?? ''}>
            <Header />
            {children}
            <Toaster richColors/>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

