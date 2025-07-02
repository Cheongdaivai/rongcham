import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'fmklyvbwarmazwgvlxtq.supabase.co'],
  },
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
