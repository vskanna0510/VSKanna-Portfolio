import type { AnalyticsSource } from "./analytics";
import { trackResumeDownload } from "./analytics";

export const RESUME_URL = "/VSKanna_Resume.pdf";
export const RESUME_FILENAME = "VSKanna_Resume.pdf";

/** Trigger a tracked resume PDF download. Replace `public/VSKanna_Resume.pdf` with your real file. */
export function downloadResume(source: AnalyticsSource) {
  if (typeof window === "undefined") return;

  trackResumeDownload(source);

  const link = document.createElement("a");
  link.href = RESUME_URL;
  link.download = RESUME_FILENAME;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
