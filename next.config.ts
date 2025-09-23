import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
