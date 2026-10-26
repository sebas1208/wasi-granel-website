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
    ],
    /**
     * Next 16 blocks the image optimizer from fetching upstream images that resolve to a private IP
     * (an SSRF guard), and `remotePatterns` above does NOT override it — the failure is
     * `⨯ upstream image http://localhost:3001/... resolved to private ip` and the request 400s, so every
     * product photo rendered broken locally.
     *
     * The guard is right for production, where the CMS is a public domain. Only development needs the
     * exception. Note this keys off NODE_ENV, so `next build` (production) keeps the protection on.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  }
}

export default nextConfig
