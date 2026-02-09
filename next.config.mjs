/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow image optimization from Google
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
