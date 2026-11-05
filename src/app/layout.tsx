import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { CommunityProvider } from "@/components/CommunityProvider";
import { SiteChrome } from "@/components/SiteChrome";
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
  title: "Community Connect",
  description: "Social development events platform for community action and volunteer engagement.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body>
        <AuthProvider>
          <CommunityProvider>
            <SiteChrome>{children}</SiteChrome>
            <Toaster richColors position="top-right" />
          </CommunityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
