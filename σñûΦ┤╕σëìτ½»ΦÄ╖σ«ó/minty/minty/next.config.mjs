/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Production note: front a Postgres datasource via DATABASE_URL and run behind
  // Nginx (SSL termination) per the deployment architecture in the spec.
};

export default nextConfig;
