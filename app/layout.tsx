import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
