import { createFileRoute } from "@tanstack/react-router";
import { ArcadePage } from "@/components/arcade/ArcadeHub";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Arcade · V S Kanna" },
      { name: "description", content: "A few small browser games I made for fun — Pong, Snake, and more." },
      { property: "og:title", content: "Arcade · V S Kanna" },
      { property: "og:description", content: "Small browser games built into the portfolio." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  component: ArcadePage,
});
