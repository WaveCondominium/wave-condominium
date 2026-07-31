/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.18.21:3000"],
    },
  },
  // Página de boas-vindas (landing) na entrada do site. Servida como HTML
  // estático de public/landing.html, antes do login. Os CTAs "Entrar/Acessar"
  // levam para /login. beforeFiles garante que "/" abra a landing.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
  // images: {
  //   disableStaticImages: true, // Re-enabled static images
  // },
};
export default nextConfig;