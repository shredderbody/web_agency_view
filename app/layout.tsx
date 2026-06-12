import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Anton, Marcellus } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { LangProvider } from "@/lib/lang-context";
import { ScrollProgress, PageFade } from "@/components/RouteMotion";
import { SITE_URL } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atelier Vitrine · Des sites web qui donnent envie de pousser la porte",
    template: "%s · Atelier Vitrine",
  },
  description:
    "Atelier Vitrine conçoit des sites web sur-mesure pour les commerces de quartier : barbiers, ongleries, charcutiers-traiteurs, restaurants. Voyez votre future vitrine en ligne avant de décider.",
  openGraph: {
    title: "Atelier Vitrine · La vitrine en ligne de votre commerce",
    description:
      "Des sites web sur-mesure pour les artisans et commerces de proximité. Visitez nos démos et projetez-vous.",
    type: "website",
    locale: "fr_FR",
    siteName: "Atelier Vitrine",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efe2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${hanken.variable} ${anton.variable} ${marcellus.variable}`}>
      <body>
        <LangProvider>
          <ScrollProgress />
          <PageFade>{children}</PageFade>
        </LangProvider>
      </body>
    </html>
  );
}
