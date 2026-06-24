import { createFileRoute } from "@tanstack/react-router";
import { AILab } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/ai-lab")({
  head: () => ({
    meta: [
      { title: "AI Lab · V S Kanna" },
      {
        name: "description",
        content: "ML projects plus a small interactive demo you can play with on the page.",
      },
      { property: "og:title", content: "AI Lab · V S Kanna" },
      { property: "og:description", content: "AI and ML work, with an interactive demo." },
    ],
  }),
  component: () => (
    <SectionLayout>
      <AILab />
    </SectionLayout>
  ),
});
