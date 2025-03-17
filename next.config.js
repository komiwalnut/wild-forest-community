/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: []
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lords',
        permanent: true,
      },
    ]
  }
};

module.exports = nextConfig;