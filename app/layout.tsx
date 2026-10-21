import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Launcher } from "@/components/site/launcher";
import { SEO_DESCRIPTION, SEO_TITLE, SITE, SOCIAL_IMAGE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    default: SEO_TITLE,
    template: "%s — interior.dev",
  },
  description: SEO_DESCRIPTION,
  applicationName: "interior.dev",
  keywords: [
    "micro-interactions",
    "react components",
    "animated react components",
    "react micro-interactions",
    "free react components",
    "open source react component library",
    "copy paste react components",
    "react animation components",
    "tailwind react components",
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
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [SOCIAL_IMAGE.url],
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
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
        <link rel="alternate" type="text/plain" href={`${SITE}/llms.txt`} title="LLM reference" />
        <noscript>
          <style>{`.docs-enter { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Launcher />
        <Analytics />
      </body>
    </html>
  );
}
