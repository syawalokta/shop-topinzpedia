import type { NextConfig } from "next";

/**
 * Security headers diterapkan ke semua route.
 * - HSTS: paksa HTTPS (aktif di production)
 * - X-Frame-Options + frame-ancestors: cegah clickjacking
 * - X-Content-Type-Options: cegah MIME sniffing
 * - Referrer-Policy & Permissions-Policy: batasi kebocoran data & API sensitif
 * CSP dibuat longgar secukupnya: mengizinkan Cloudflare Turnstile,
 * gambar Cloudinary/HTTPS, dan style inline (dibutuhkan Next/Tailwind).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "frame-src https://challenges.cloudflare.com",
      "connect-src 'self' https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /* Mongoose dijalankan sebagai package eksternal di server (tidak dibundel) */
  serverExternalPackages: ["mongoose"],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
