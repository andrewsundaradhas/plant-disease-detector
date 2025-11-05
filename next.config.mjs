/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable server actions
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@tensorflow/tfjs', 'canvas'],
  },
  
  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  
  // Images configuration
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
        canvas: false,
      };
    }
    
    return config;
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable Turbopack
  experimental: {
    turbo: false,
  },
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
