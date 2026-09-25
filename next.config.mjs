/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,

  // temporal-polyfill's ESM build uses a top-level-await shape that
  // webpack can't represent in the CommonJS server bundles Next 14 emits
  // for Server Actions / Route Handlers (serverComponentsExternalPackages
  // only reliably covers RSC pages in this version). Force it - and pg,
  // its usual companion - to stay an unbundled runtime require() instead.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals];
      config.externals = [...externals, 'temporal-polyfill', 'pg'];
    }
    return config;
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables exposed to the browser (prefix with NEXT_PUBLIC_)
  env: {
    APP_NAME: process.env.APP_NAME,
  },

  // Redirect and rewrite rules can be added here
  async redirects() {
    return [];
  },

  async rewrites() {
    return [];
  },

  // HTTP security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
