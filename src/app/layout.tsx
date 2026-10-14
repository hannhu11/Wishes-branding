import type { Metadata, Viewport } from "next";
import { Playfair_Display, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#FFAEC9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "WISHES 🎂 Capstone Project - Digital Art & Design",
  description: "Boutique Pastry & Digital Experience by Nguyen Hong Thu Phuong (PHUONGNHT8 - GFA26GD60 - Fall 2026 - FPT University). Make a wish. Take a bite.",
  keywords: ["Wishes", "Capstone Project", "Digital Art & Design", "FPT University", "Branding", "3D Surrealism", "Three.js", "GSAP"],
  authors: [{ name: "Nguyen Hong Thu Phuong" }],
  openGraph: {
    title: "WISHES — Capstone Showcase (Fall 2026)",
    description: "Make a wish. Take a bite. Boutique Pastry Experience in 3D Surrealism.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${fredoka.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="bg-wishes-cream text-wishes-chocolate min-h-screen selection:bg-wishes-pink selection:text-wishes-chocolate bg-noise">
        {children}
      </body>
    </html>
  );
}
