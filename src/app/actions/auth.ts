"use server";

import { login, logout, getCurrentUser } from "@/server/services/authService";

export async function loginAction(email: string, password: string) {
  const result = await login(email, password);
  if (!result.ok) return { error: { message: result.error }, user: null };
  return { error: null, user: result.user };
}

export async function logoutAction() {
  await logout();
  return { ok: true };
}

export async function meAction() {
  return getCurrentUser();
}