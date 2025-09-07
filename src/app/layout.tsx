import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Navigation from "@/components/navigation";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nihal's Prompts",
  description: "A minimalist platform for creating, managing, and sharing AI prompts",
  keywords: ["AI", "Prompts", "Machine Learning", "GPT", "Claude"],
  authors: [{ name: "Nihal Shah" }],
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} font-sans antialiased min-h-screen bg-black text-white`}
        style={{
          backgroundImage: 'url(/bg-pattern.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          backgroundPosition: '0 0'
        }}
      >
        <div className="relative flex min-h-screen flex-col bg-pattern">
          <Navigation initialUser={user} />
          <div className="flex-1 pt-24">{children}</div>
        </div>
      </body>
    </html>
  );
}
