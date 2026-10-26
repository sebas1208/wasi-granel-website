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
  },
  /**
   * The Live Preview pane carries PREVIEW_SECRET in its URL — the pattern Payload's and Next's own docs
   * use for a preview route. That is workable but the URL is a secret in a place URLs leak from, so two
   * headers close the realistic holes:
   *
   *  - `Referrer-Policy: no-referrer` stops the secret travelling to any third-party resource the preview
   *    page loads (fonts, analytics, an image host). This is the one that actually matters: without it,
   *    one external request from the preview page hands the secret to whoever serves it.
   *  - `X-Robots-Tag: noindex` keeps a stray crawl out of the picture. The URL is never linked publicly,
   *    but this costs nothing.
   *
   * Scoped to /preview, so nothing about the public site changes.
   */
  async headers() {
    return [
      {
        source: "/preview",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}

export default nextConfig
