/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/compare",
        destination: "/career",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
