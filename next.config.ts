import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Mongoose dijalankan sebagai package eksternal di server (tidak dibundel) */
  serverExternalPackages: ["mongoose"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
