import type { NextConfig } from "next";

const grafanaInternal =
  process.env.GRAFANA_INTERNAL_URL ?? "http://127.0.0.1:3010";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/grafana",
        destination: `${grafanaInternal}/`,
      },
      {
        source: "/grafana/:path*",
        destination: `${grafanaInternal}/:path*`,
      },
    ];
  },
};

export default nextConfig;
