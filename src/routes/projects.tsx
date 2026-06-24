import { createFileRoute } from "@tanstack/react-router";
import { Projects } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · V S Kanna" },
      {
        name: "description",
        content:
          "Selected projects — deepfake detection, mental-health AI, ERP work, and hackathon builds.",
      },
      { property: "og:title", content: "Projects · V S Kanna" },
      { property: "og:description", content: "Things I've built, with details and tech stacks." },
    ],
  }),
  component: () => (
    <SectionLayout>
      <Projects />
    </SectionLayout>
  ),
});
