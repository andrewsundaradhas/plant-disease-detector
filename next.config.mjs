/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Experimental features
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@tensorflow/tfjs'],
    turbo: false,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Images configuration
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
  
  // Output configuration for AWS Amplify
  output: 'export',
  distDir: '.next',
  
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
