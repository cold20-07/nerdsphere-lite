import type { Metadata } from "next";
import { Space_Grotesk, Exo_2 } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NerdSphere - Anonymous Global Chat",
  description: "An experimental anonymous global chat room. No moderation. Expect chaos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${exo2.variable}`}>
      <body className="antialiased font-body">
        {children}
      </body>
    </html>
  );
}
