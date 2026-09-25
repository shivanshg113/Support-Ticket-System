/** @type {import('next').NextConfig} */
const nextConfig = {
  // All business rules enforced on the backend.
  // Frontend communicates exclusively via REST API.
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
