import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Fire Safety | Signage Analyzer",
    description: "AI-powered architectural floor plan analysis for fire safety compliance",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${outfit.className} bg-charcoal-900 text-slate-100 selection:bg-hazard-orange selection:text-white`}>
                {children}
            </body>
        </html>
    );
}
