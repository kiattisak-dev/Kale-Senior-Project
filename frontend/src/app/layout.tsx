import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/ui/authcontext";
import { LayoutProvider } from "@/components/ui/LayoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kale Analysis Platform",
  description:
    "Premium AI-powered kale analysis and segmentation platform for quality assessment",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 font-sans antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem={true}
        >
          <AuthProvider>
            <LayoutProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </LayoutProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
