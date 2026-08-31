/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Keep the libSQL/Turso driver out of the server bundle (it has optional native bits).
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  },
};

export default nextConfig;
