// @ts-check

const TerserPlugin = require('terser-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals = config.externals || [];
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Adding optimization to avoid Terser errors
  optimization: {
    minimize: true,
   
    // Adding a custom Terser configuration
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 2020,
          compress: {
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
};

module.exports = nextConfig;
