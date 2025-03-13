// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://fleet-moose-76.clerk.accounts.dev
    https://cdn.jsdelivr.net
    https://js.clerk.com
    https://js.sentry-cdn.com
    https://challenges.cloudflare.com;
  connect-src 'self'
    https://fleet-moose-76.clerk.accounts.dev
    https://api.clerk.com
    https://clerk.sentry.io
    https://*.ingest.sentry.io
    https://*.s3.us-east-2.amazonaws.com
    https://s3.amazonaws.com;
  img-src 'self'
    https://img.clerk.com
    data:;
  style-src 'self' 'unsafe-inline'
    https://cdn.jsdelivr.net;
  font-src 'self'
    https://cdn.jsdelivr.net;
  frame-src 'self'
    https://clerk.com
    https://challenges.cloudflare.com
    https://fleet-moose-76.clerk.accounts.dev;
  form-action 'self'
    https://fleet-moose-76.clerk.accounts.dev;
  worker-src 'self' blob:;
`.replace(/\n/g, ' ').replace(/\s+/g, ' ');

const nextConfig = {
  webpack: (/** @type {import('webpack').Configuration} */ config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      stream: require.resolve("stream-browserify"),
      http: require.resolve("stream-http"),
      crypto: require.resolve("crypto-browserify")
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;