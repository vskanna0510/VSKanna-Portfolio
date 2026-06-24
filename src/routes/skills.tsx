import { createFileRoute } from "@tanstack/react-router";
import { Skills } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills · V S Kanna" },
      { name: "description", content: "Languages, frameworks, and tools I use for web, backend, databases, and AI work." },
      { property: "og:title", content: "Skills · V S Kanna" },
      { property: "og:description", content: "What I work with — languages, frontend, backend, AI, and DevOps." },
    ],
  }),
  component: () => <SectionLayout><Skills /></SectionLayout>,
});
