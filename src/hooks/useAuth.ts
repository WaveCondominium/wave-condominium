import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, logoutAction, meAction } from "@/app/actions/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Morador" | "Síndico" | "Administradora";
  unit: string;
  walletAddress?: string;
  photoUrl?: string;
}

function toUser(p: {
  id: string; email: string; name: string;
  role: User["role"]; unit: string | null; photoUrl: string | null;
}): User {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
    unit: p.unit ?? "",
    photoUrl: p.photoUrl ?? undefined,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const me = await meAction();
      setUser(me ? toUser(me) : null);
    } catch (error) {
      console.error("Auth check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await loginAction(email, password);
      if (res.error) return { error: res.error };
      setUser(res.user ? toUser(res.user) : null);
      router.push("/dashboard");
      return { error: null };
    } catch (err) {
      console.error(err);
      return { error: { message: "Erro ao realizar login" } };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await logoutAction();
    setUser(null);
    router.push("/login");
  }

  return { user, loading, login, logout, isAuthenticated: !!user };
}