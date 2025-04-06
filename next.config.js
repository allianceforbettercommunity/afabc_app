/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // ✅ turn this on
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;