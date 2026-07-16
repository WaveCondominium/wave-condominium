/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.18.21:3000"],
    },
  },
  // images: {
  //   disableStaticImages: true, // Re-enabled static images
  // },
};
export default nextConfig;