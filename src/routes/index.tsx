import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { CustomCursor } from "@/components/portfolio/CustomCursor";
import portraitUrl from "@/assets/v2-3d-pixar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "V S Kanna — Full Stack & AI Engineer" },
      {
        name: "description",
        content:
          "I'm a full-stack and AI engineer at SSN. This site has my projects, GitHub stats, and contact info.",
      },
      { property: "og:title", content: "V S Kanna — Full Stack & AI Engineer" },
      {
        property: "og:description",
        content: "Full-stack and AI engineer. M.E. CSE at SSN. Projects, hackathons, and contact.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preload", as: "image", href: portraitUrl, fetchPriority: "high" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <CustomCursor />
      <Portfolio />
    </>
  );
}
