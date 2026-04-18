import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Barlow_Condensed, Bebas_Neue } from "next/font/google";
import "./globals.css";
import FontsLoader from "./FontsLoader";

// IBM Plex Mono — cold, data-native, reads like terminal output
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

// Barlow Condensed — UI labels, descriptors, tags
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

// Bebas Neue — wordmark fallback (Bierika preferred via @font-face)
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-wordmark",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#08080A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export const metadata: Metadata = {
  title: "VeloForge — Computational Engineering, Redefined",
  description:
    "End-to-end parametric generative engineering + automated FEA pipeline. " +
    "Designs 2-wheeler components from parameters alone — no manual CAD. " +
    "Structurally validated parts, fast.",
  keywords: [
    "generative engineering",
    "FEA",
    "finite element analysis",
    "parametric design",
    "brake bracket",
    "computational engineering",
    "CAD automation",
  ],
  openGraph: {
    title: "VeloForge — Computational Engineering, Redefined",
    description:
      "Parametric generative engineering + automated FEA. " +
      "Watch the machine design itself.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${barlowCondensed.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <head>
        {/* Preload Bierika OTF — eliminates FOUC on wordmark */}
        <link
          rel="preload"
          href="/fonts/Bierika/Bierika.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full overflow-x-hidden">
        {/* Adds fonts-loaded class once document.fonts resolves */}
        <FontsLoader />
        {children}
      </body>
    </html>
  );
}
