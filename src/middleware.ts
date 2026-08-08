import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.WAVE_SESSION_SECRET;
  if (!secret) throw new Error("WAVE_SESSION_SECRET nao configurada.");
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("wave_session")?.value;

  // --- Sem sessão: redireciona para login ---
  if (!token) {
    // Se já está em rota pública, segue normalmente
    if (req.nextUrl.pathname === "/force-change-password") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --- Decodifica o JWT para checar mustChangePassword ---
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const mustChange = Boolean(payload.mustChangePassword);
    const isForceChangePage = req.nextUrl.pathname === "/force-change-password";

    if (mustChange && !isForceChangePage) {
      // Bloqueia acesso ao dashboard; redireciona para troca obrigatória
      return NextResponse.redirect(new URL("/force-change-password", req.url));
    }

    if (!mustChange && isForceChangePage) {
      // Já trocou a senha, não precisa ficar nesta página
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch {
    // Token inválido/expirado — limpa e manda para login
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("wave_session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/force-change-password"],
};