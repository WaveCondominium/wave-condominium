/** @type {import('next').NextConfig} */

// Origens permitidas para Server Actions (Next 14 valida o header Origin).
// Mantém as origens fixas e acrescenta, sem hardcode por ambiente:
//   - WAVE_ALLOWED_ORIGINS: lista separada por vírgula
//   - VERCEL_URL / VERCEL_BRANCH_URL / VERCEL_PROJECT_PRODUCTION_URL: hosts da Vercel
const DEFAULT_ORIGINS = [
  "localhost:3000",
  "192.168.18.21:3000",
  "wave-condominium.vercel.app", // produção (Vercel)
  "wavecondominium.com.br", // produção (domínio customizado)
  "www.wavecondominium.com.br", // produção (www)
  "homolog.wavecondominium.com.br", // homologação (domínio customizado)
];

const envOrigins = (process.env.WAVE_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelOrigins = [
  process.env.VERCEL_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
].filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...DEFAULT_ORIGINS, ...envOrigins, ...vercelOrigins]),
);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
};
export default nextConfig;
