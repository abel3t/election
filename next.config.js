/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  styledComponents: true,
  images: { domains: ["election-v1.s3.ap-southeast-1.amazonaws.com"] },
};

module.exports = nextConfig;
