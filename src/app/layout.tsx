import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Madhyam AI",
  description: "From developer intent to intelligent execution. AI-powered technical workflow orchestration for engineering teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={
        {
          "--font-geist-sans": "'Geist', system-ui, -apple-system, sans-serif",
          "--font-geist-mono": "'Geist Mono', 'Courier New', monospace",
        } as React.CSSProperties
      }
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
