import { createFileRoute } from "@tanstack/react-router";
import { Achievements } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements · V S Kanna" },
      {
        name: "description",
        content: "Hackathon results, certifications, and competitive programming practice.",
      },
      { property: "og:title", content: "Achievements · V S Kanna" },
      { property: "og:description", content: "Competitions, certs, and coding practice." },
    ],
  }),
  component: () => (
    <SectionLayout>
      <Achievements />
    </SectionLayout>
  ),
});
