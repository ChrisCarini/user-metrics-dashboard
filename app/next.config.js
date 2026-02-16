const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

const readConfig = () => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '..', 'config.yml'),
    'utf8',
  );
  return yaml.parse(file);
};

const config = readConfig();
const productionBasePath = config.basePath ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx', 'json'],
  basePath: process.env.NODE_ENV === 'development' ? '' : productionBasePath,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
