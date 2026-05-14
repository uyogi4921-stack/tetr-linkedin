import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TETR-Connect | Community Platform for Tetr College of Business",
  description: "Connect with batch-mates, explore opportunities, join clubs, and build your professional network at Tetr College of Business.",
  applicationName: "TETR-Connect",
  openGraph: {
    title: "TETR-Connect",
    description: "Community platform for Tetr College of Business. Connect with batch-mates, join clubs, and build your professional network.",
    siteName: "TETR-Connect",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TETR-Connect",
    description: "Community platform for Tetr College of Business. Connect with batch-mates, join clubs, and build your professional network.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
