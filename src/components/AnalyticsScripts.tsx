const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
const UMAMI_SCRIPT_URL =
  import.meta.env.VITE_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";

/** Loads Plausible and/or Umami when env vars are set. Safe to render with neither configured. */
export function AnalyticsScripts() {
  if (!PLAUSIBLE_DOMAIN && !UMAMI_WEBSITE_ID) return null;

  return (
    <>
      {PLAUSIBLE_DOMAIN ? (
        <script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      ) : null}
      {UMAMI_WEBSITE_ID ? (
        <script defer src={UMAMI_SCRIPT_URL} data-website-id={UMAMI_WEBSITE_ID} />
      ) : null}
    </>
  );
}
