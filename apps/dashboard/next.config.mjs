/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set base path for the dashboard app
  basePath: '/dashboard',
  assetPrefix: '/dashboard',

  // Configure rewrites for internal routing
  async rewrites() {
    return {
      beforeFiles: [
        // Handle internal API routes
        {
          source: '/dashboard/api/:path*',
          destination: '/api/:path*',
        },
        // Handle static files
        {
          source: '/dashboard/_next/:path*',
          destination: '/_next/:path*',
        },
        // Proxy GraphQL requests to avoid CORS issues
        {
          source: '/api/graphql',
          destination: 'http://122.166.245.97:8086/graphql',
        },
      ],
    };
  },

  // Configure headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          // Allow embedding in iframe
          { key: 'X-Frame-Options', value: 'ALLOW-FROM http://localhost:3000' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' http://localhost:3000" },
        ],
      },
    ];
  },

  // Enable strict mode for better development experience
  reactStrictMode: false,

  // Configure webpack for better module resolution
  webpack: (config, { isServer }) => {
    // Add any webpack customizations here if needed
    return config;
  },
};

export default nextConfig;
