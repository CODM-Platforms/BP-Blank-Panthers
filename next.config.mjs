/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,

  // @react-pdf/renderer pulls in yoga-layout (WASM) and fontkit's data
  // files read via runtime fs calls. Letting webpack bundle it mangles
  // those and causes a 500 on Vercel that never shows up locally - keep
  // it external so Node requires it natively at runtime instead.
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },

  // pg is a native-ish runtime dependency; leave it unbundled and let Node
  // resolve it natively at runtime instead of forcing it through webpack.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals];
      config.externals = [...externals, 'pg'];
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
