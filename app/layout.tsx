import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Custom Energy Gels for Runners & Cyclists | ReFuel Athletics",
  description:
    "Build your perfect energy gel. Personalize carbs, electrolytes, caffeine, and flavor for your sport and body. Reusable packets, zero waste, race-ready fuel.",
  keywords: [
    "custom energy gel",
    "personalized running gel",
    "endurance nutrition",
    "marathon fuel",
    "triathlon gel",
    "custom electrolyte gel",
    "reusable gel packet",
    "homemade energy gel",
    "caffeine gel for runners",
    "sports nutrition gel",
    "build your own gel",
    "cycling gel",
    "ultra marathon fuel",
    "trail running nutrition",
  ],
  authors: [{ name: "ReFuel Athletics", url: "https://refuelgel.com" }],
  creator: "ReFuel Athletics",
  publisher: "ReFuel Athletics",
  metadataBase: new URL("https://refuelgel.com"),
  alternates: {
    canonical: "https://refuelgel.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "https://refuelgel.com",
    title: "Custom Energy Gels for Runners & Cyclists | ReFuel Athletics",
    description:
      "Build your perfect energy gel. Personalize carbs, electrolytes, caffeine, and flavor for your sport. Reusable packets — zero waste, race-ready fuel.",
    siteName: "ReFuel Athletics",
    images: [
      {
        url: "https://refuelgel.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReFuel Athletics — Custom Energy Gels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Energy Gels for Runners & Cyclists | ReFuel Athletics",
    description:
      "Build your perfect energy gel. Personalize carbs, electrolytes, caffeine, and flavor for your sport.",
    images: ["https://refuelgel.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://refuelgel.com/#organization",
      name: "ReFuel Athletics",
      url: "https://refuelgel.com",
      logo: {
        "@type": "ImageObject",
        url: "https://refuelgel.com/refuel-logo.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "haydenh.refuel@gmail.com",
        contactType: "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://refuelgel.com/#website",
      url: "https://refuelgel.com",
      name: "ReFuel Athletics",
      description: "Custom personalized energy gels for endurance athletes. Build your perfect formula.",
      publisher: { "@id": "https://refuelgel.com/#organization" },
    },
    {
      "@type": "Store",
      "@id": "https://refuelgel.com/#store",
      name: "ReFuel Athletics",
      url: "https://refuelgel.com",
      description: "Custom energy gels and reusable gel packets for runners, cyclists, and triathletes.",
      priceRange: "$$",
      currenciesAccepted: "USD",
      paymentAccepted: "Credit Card",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "ReFuel Athletics Products",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Custom Gel Powder",
              description: "Personalized energy gel powder with custom carbohydrates, electrolytes, caffeine, and flavor. Built for your sport and your body.",
              brand: { "@type": "Brand", name: "ReFuel Athletics" },
              category: "Sports Nutrition",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Reusable Gel Packet",
              description: "BPA-free food-grade silicone reusable gel packet. Dishwasher safe, leak-proof twist-lock nozzle. Zero waste race fuel.",
              brand: { "@type": "Brand", name: "ReFuel Athletics" },
              category: "Sports Equipment",
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}