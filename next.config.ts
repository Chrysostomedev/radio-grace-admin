import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rge-radio.duckdns.org",
      },
      {
        protocol: "http",
        hostname: "rge-radio.duckdns.org",
      },
      {
        protocol: "https",
        hostname: "api.radio.graceespoir.ci",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "10.201.75.39",
      },
    ],
  },
};

export default nextConfig;