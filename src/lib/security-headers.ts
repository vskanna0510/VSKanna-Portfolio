/** Baseline security headers for HTML and API responses. */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://plausible.io https://*.umami.is https://cloud.umami.is",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://github.com https://*.githubusercontent.com",
    "connect-src 'self' https://api.github.com https://github-contributions-api.jogruber.de",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
  ].join("; ");

  headers.set("Content-Security-Policy", csp);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
