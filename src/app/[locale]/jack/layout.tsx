import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jack — The AI Copilot for Mobility",
  description:
    "Voice-first intelligence designed for the future of transportation. Jack keeps your eyes on the road and your hands on the wheel — powered by AI, built for drivers.",
  openGraph: {
    title: "Jack — The AI Copilot for Mobility",
    description:
      "Voice-first intelligence. Eyes on the road. Zero screen taps. Jack is the AI co-pilot you've always needed behind the wheel.",
    url: "https://js17.dev/jack",
    siteName: "Jack by js17.dev",
    images: [
      {
        url: "https://js17.dev/jack/og.png",
        width: 1200,
        height: 630,
        alt: "Jack — The AI Copilot for Mobility",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jack — The AI Copilot for Mobility",
    description: "Voice-first intelligence. Eyes on the road. Zero screen taps.",
  },
}

export default function JackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
