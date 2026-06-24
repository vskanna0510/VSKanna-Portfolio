import { createFileRoute } from "@tanstack/react-router";
import { GitHubSection } from "@/components/portfolio/GitHubSection";
import { GITHUB_USER } from "@/components/portfolio/Portfolio";
import { SectionLayout } from "@/components/portfolio/SectionLayout";

export const Route = createFileRoute("/github")({
  head: () => ({
    meta: [
      { title: "GitHub · V S Kanna" },
      { name: "description", content: "Live GitHub stats — repos, contributions, and languages from my profile." },
      { property: "og:title", content: "GitHub · V S Kanna" },
      { property: "og:description", content: "My GitHub activity and top repositories." },
    ],
  }),
  component: () => (
    <SectionLayout>
      <GitHubSection user={GITHUB_USER} />
    </SectionLayout>
  ),
});
