import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sans = Libre_Franklin({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Restaurant Journal",
  description: "Track restaurants, rate them, and discover where your friends eat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans antialiased min-h-screen bg-brand-50 text-stone-800`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
