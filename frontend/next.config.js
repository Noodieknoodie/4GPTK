/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config) => {
      config.resolve.extensions = ['.js', '.jsx', '.json', '.ts', '.tsx', ...config.resolve.extensions];
      return config;
    },
  };
  
  module.exports = nextConfig;