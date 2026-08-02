import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const scriptSrc = isProduction
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

// Allow custom OpenAI-compatible base URLs to avoid blocking proxies or
// self-hosted gateways while still keeping a safe default allow-list.
const allowedConnectSources = [
  "'self'",
  "ws:",
  "wss:",
  "https://api.openai.com",
  "https://api.deepseek.com",
  "https://openrouter.ai",
];
for (const baseUrl of [
  process.env.OPENAI_BASE_URL,
  process.env.DEEPSEEK_BASE_URL,
  process.env.OPENROUTER_BASE_URL,
]) {
  if (baseUrl && baseUrl.startsWith("https://")) {
    allowedConnectSources.push(baseUrl.replace(/\/+$/, ""));
  }
}
const connectSrc = `connect-src ${allowedConnectSources.join(" ")}`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      connectSrc,
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
];

if (isProduction) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
