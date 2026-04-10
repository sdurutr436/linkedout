import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["playwright", "prisma", "@prisma/client"],
};

export default nextConfig;
