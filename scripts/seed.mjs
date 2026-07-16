import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const condo = await prisma.condominium.upsert({
  where: { id: "seed-condo" },
  update: {},
  create: { id: "seed-condo", name: "Condominio Demo" },
});

const passwordHash = await argon2.hash("Senha@12345", { type: argon2.argon2id });

const demoUsers = [
  { email: "admin@wave.com",   name: "Administrador Wave", role: "ADMIN",   unit: "Administracao" },
  { email: "sindico@wave.com", name: "Joao Silva",         role: "SINDICO", unit: "Apto 101" },
  { email: "morador@wave.com", name: "Maria Santos",       role: "MORADOR", unit: "Apto 203" },
];

for (const u of demoUsers) {
  await prisma.user.upsert({
    where: { condominiumId_email: { condominiumId: condo.id, email: u.email } },
    update: { passwordHash },
    create: { ...u, passwordHash, condominiumId: condo.id },
  });
  console.log("Seed ok ->", u.email, "(" + u.role + ")");
}

console.log("Senha para todos: Senha@12345");
await prisma.$disconnect();