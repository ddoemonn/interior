import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Launcher } from "@/components/site/launcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE = "https://interior.dev";

const TITLE = "interior.dev";
const DESCRIPTION =
  "micro-interactions for react, built for the half-second after a click.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141312" },
  ],
};

export const metadata: Metadata = {
  // without this, Next emits a relative og:image and no crawler can resolve it
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s — interior.dev",
  },
  description: DESCRIPTION,
  applicationName: "interior.dev",
  keywords: [
    "micro-interactions",
    "react components",
    "motion",
    "framer motion",
    "tailwind css",
    "animation",
    "design system",
    "ui components",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "interior.dev",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** Sets the theme class before first paint so there is no flash. */
const themeScript = `(function(){try{var s=localStorage.getItem("interior-theme");var d=s?s==="dark":matchMedia("(prefers-color-scheme:dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Launcher />
      </body>
    </html>
  );
}
