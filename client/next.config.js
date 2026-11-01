/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone', // small production image for Docker
  images: { unoptimized: true },
};
