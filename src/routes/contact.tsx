import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact · V S Kanna" },
      { name: "description", content: "Open to full-stack, backend, and AI roles. Email, phone, and LinkedIn." },
      { property: "og:title", content: "Contact · V S Kanna" },
      { property: "og:description", content: "Want to get in touch? Here's how." },
    ],
  }),
  component: () => <SectionLayout><Contact /></SectionLayout>,
});
