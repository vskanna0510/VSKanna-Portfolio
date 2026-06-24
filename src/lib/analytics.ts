export type AnalyticsSource = "hero" | "terminal" | "resume-route" | "resume-route-retry" | "nav";

/** Fire a custom event to Plausible and/or Umami when configured via VITE_* env vars. */
export function trackEvent(name: string, props?: Record<string, string>) {
  if (typeof window === "undefined") return;

  if (import.meta.env.VITE_PLAUSIBLE_DOMAIN && window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }

  if (import.meta.env.VITE_UMAMI_WEBSITE_ID && window.umami?.track) {
    window.umami.track(name, props);
  }
}

export function trackResumeDownload(source: AnalyticsSource) {
  trackEvent("resume_download", { source });
}
