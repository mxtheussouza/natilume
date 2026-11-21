import type { NextConfig } from "next";

const sensitive = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const config: NextConfig = {
  poweredByHeader: false,
  logging: { incomingRequests: false, browserToTerminal: false },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      ...["/sala/:path*", "/admin/:path*", "/api/:path*"].map((source) => ({
        source,
        headers: sensitive,
      })),
    ];
  },
};

export default config;
