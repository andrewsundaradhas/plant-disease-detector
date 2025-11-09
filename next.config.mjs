/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Disable server-side rendering
  output: 'export',
  
  // Disable server components and actions for static export
  experimental: {
    serverActions: false,
    serverComponents: false,
    turbo: false,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors
  },
  
  // Images configuration for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://main.d2umnugeqypgjx.amplifyapp.com',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `global` object
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        global: false,
        fs: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
      };
    }
    
    return config;
  },
  
  // Build output directory
  distDir: 'out',
  
  // Disable static page generation for all pages by default
  generateEtags: false,
  
  // Enable React 18 features
  swcMinify: true,
};

// Disable Turbopack
const withTurbopack = (config) => ({
  ...config,
  experimental: {
    ...config.experimental,
    turbo: false,
  },
});

export default withTurbopack(nextConfig);
