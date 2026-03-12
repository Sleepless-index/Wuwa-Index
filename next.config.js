/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Set basePath to your repo name when hosting on GitHub Pages
  // e.g. basePath: '/wuwa-tracker'
  // Leave empty if using a custom domain or root repo
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
};

module.exports = nextConfig;
