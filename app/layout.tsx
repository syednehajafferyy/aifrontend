import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevForge AI - Workspace",
  description: "AI-Powered React Component Builder with Google Gemini AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
