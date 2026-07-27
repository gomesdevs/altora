import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@altora/domain", "@altora/ui"],
};

export default nextConfig;
