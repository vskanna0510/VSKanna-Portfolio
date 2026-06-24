import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · V S Kanna" },
      { name: "description", content: "My background — from CIT undergrad to SSN postgrad, internships, and what I've built along the way." },
      { property: "og:title", content: "About · V S Kanna" },
      { property: "og:description", content: "Education, internships, and how I got here." },
    ],
  }),
  component: () => <SectionLayout><About /></SectionLayout>,
});
