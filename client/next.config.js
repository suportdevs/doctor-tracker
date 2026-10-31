const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone', // small production image for Docker
  images: { unoptimized: true },
  // Uploaded images are stored as "/uploads/…" — serve them from the site's own origin.
  async rewrites() {
    return [{ source: '/uploads/:path*', destination: `${API_URL}/uploads/:path*` }];
  },
};
