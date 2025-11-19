import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Site",
  description: "A basic Next.js starter template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen max-w-6xl mx-auto px-4 pt-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
