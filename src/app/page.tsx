import { redirect } from 'next/navigation';

// A raiz "/" e servida pela landing estatica (public/landing.html) via rewrite
// em next.config.mjs. Este redirect e apenas um fallback caso o rewrite nao
// intercepte a rota — leva o usuario a pagina de boas-vindas.
export default function Home() {
  redirect('/landing.html');
}
