import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/lib/rbac";

const COOKIE_NAME = "wave_session";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

export interface SessionPayload {
  userId: string;
  role: Role;
  condominiumId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.WAVE_SESSION_SECRET;
  if (!secret) throw new Error("WAVE_SESSION_SECRET nao configurada.");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(MAX_AGE_SECONDS + "s")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId),
      role: payload.role as Role,
      condominiumId: String(payload.condominiumId),
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}