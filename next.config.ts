import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Requis pour le Dockerfile (image légère, server.js autonome)
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rge-radio.duckdns.org" },
      { protocol: "https", hostname: "api.radio.graceespoir.ci" },

      // Hôtes locaux : uniquement en développement
      ...(isDev
        ? ([
            { protocol: "http", hostname: "localhost" },
            { protocol: "http", hostname: "127.0.0.1" },
            { protocol: "http", hostname: "10.201.75.39" },
          ] as const)
        : []),
    ],
  },
};

export default nextConfig;