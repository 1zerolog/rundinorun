import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DinoRun - Jump, Score & Mint NFTs",
  description:
    "Fast-paced retro dino runner game on Farcaster. Jump over obstacles, compete for high scores, and mint your achievements as NFTs on Base network.",
  openGraph: {
    title: "DinoRun - Jump, Score & Mint NFTs",
    description: "Jump over obstacles, survive as long as possible, and mint your high scores as NFTs on Base network!",
    images: ["https://rundinorun.vercel.app/dino-hero.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DinoRun - Jump, Score & Mint NFTs",
    description: "Jump over obstacles, survive as long as possible, and mint your high scores as NFTs on Base network!",
    images: ["https://rundinorun.vercel.app/dino-hero.svg"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta
          name="fc:miniapp"
          content='{
            "version": "next",
            "imageUrl": "https://1rundinorun.vercel.app/dino-hero.svg",
            "button": {
              "title": "Play DinoRun",
              "action": {
                "type": "launch_frame",
                "url": "https://1rundinorun.vercel.app",
                "name": "DinoRun",
                "splashImageUrl": "https://1rundinorun.vercel.app/splash.jpg",
                "splashBackgroundColor": "#6200EA"
              }
            }
          }'
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
