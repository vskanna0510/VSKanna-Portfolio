import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { downloadResume } from "@/lib/resume";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume · V S Kanna" },
      { name: "description", content: "Download V S Kanna's resume — full-stack and AI engineer." },
      { property: "og:title", content: "Resume · V S Kanna" },
      { property: "og:description", content: "Full-stack and AI engineer. M.E. CSE at SSN." },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  useEffect(() => {
    downloadResume("resume-route");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Downloading resume…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your PDF should start automatically. If not, use the button below.
        </p>
        <button
          type="button"
          onClick={() => downloadResume("resume-route-retry")}
          className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground animate-gradient"
          style={{ backgroundImage: "var(--gradient-brand)" }}
        >
          Download again
        </button>
        <div className="mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
