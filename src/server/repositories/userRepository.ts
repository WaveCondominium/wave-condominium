import { prisma } from "@/server/db";
import type { Role as PrismaRole } from "@prisma/client";

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role: PrismaRole;
  unit?: string | null;
  photoUrl?: string | null;
  condominiumId: string;
}

export const userRepository = {
  // NOTA multi-tenant: por ora busca so por e-mail (fase de 1 condominio).
  // Quando houver varios condominios, o login precisa de subdominio/seletor
  // para desambiguar, pois e-mail e unico apenas POR condominio.
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: CreateUserInput) {
    return prisma.user.create({
      data: { ...data, email: data.email.toLowerCase().trim() },
    });
  },
};