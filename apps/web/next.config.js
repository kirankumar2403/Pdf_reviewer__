/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pdf-dashboard/types"],
  webpack: (config) => {
    // Configure webpack for pdf.js
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Handle PDF.js worker and font files
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: {
        loader: 'worker-loader',
        options: {
          name: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      },
    });
    
    // Handle font files for PDF.js
    config.module.rules.push({
      test: /\.(ttf|otf|eot|woff|woff2)$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001',
  },
}

module.exports = nextConfig
