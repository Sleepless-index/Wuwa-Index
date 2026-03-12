/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' removed — enables Vercel serverless API routes for gacha import
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
