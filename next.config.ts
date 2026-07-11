import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Mengizinkan akses development dari IP jaringan lokal
  allowedDevOrigins: [
    "http://192.168.1.9:3000",
  ],
};

export default nextConfig;