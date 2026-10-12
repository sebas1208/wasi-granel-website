/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "payload.wasigranel.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ]
  }
}

export default nextConfig
