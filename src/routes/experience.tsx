import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience · V S Kanna" },
      { name: "description", content: "Jobs, internships, and my current M.E. at SSN." },
      { property: "og:title", content: "Experience · V S Kanna" },
      { property: "og:description", content: "Work history and education." },
    ],
  }),
  component: () => <SectionLayout><Experience /></SectionLayout>,
});
