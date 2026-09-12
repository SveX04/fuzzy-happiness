import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self-Evolving Website",
  description: "An AI agent that proposes changes to its own component through GitHub pull requests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
