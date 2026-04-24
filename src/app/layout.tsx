import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agnivesh Voice Bot",
  description: "Web chatbot with voice input and output"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
