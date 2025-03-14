/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: []
  },
  env: {
    REDIS_URL: process.env.REDIS_URL,
  }
};

module.exports = nextConfig;