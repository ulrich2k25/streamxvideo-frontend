/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Désactive ESLint pendant le build
  },
};

module.exports = nextConfig;
