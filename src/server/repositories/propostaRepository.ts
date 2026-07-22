// ---------------------------------------------------------------------------
// src/server/repositories/propostaRepository.ts
//
// Repositorio de Governanca (Proposta/Voto), escopado por condominiumId.
// Segue o mesmo padrao do avisoRepository (migracao localStorage -> Postgres).
//
// Requer `prisma generate` apos o schema (models Proposta/Voto).
// ---------------------------------------------------------------------------

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

export const propostaRepository = {
  listByCondominium(condominiumId: string) {
    return prisma.proposta.findMany({
      where: { condominiumId },
      include: { votos: true },
      orderBy: { criadaEm: "desc" },
    });
  },

  findById(id: string, condominiumId: string) {
    return prisma.proposta.findFirst({
      where: { id, condominiumId },
      include: { votos: true },
    });
  },

  create(data: Prisma.PropostaUncheckedCreateInput) {
    return prisma.proposta.create({ data, include: { votos: true } });
  },

  update(id: string, condominiumId: string, data: Prisma.PropostaUncheckedUpdateInput) {
    return prisma.proposta.updateMany({ where: { id, condominiumId }, data });
  },

  remove(id: string, condominiumId: string) {
    return prisma.proposta.deleteMany({ where: { id, condominiumId } });
  },

  /** Registra um voto (voto unico garantido por @@unique([propostaId, userId])). */
  createVoto(propostaId: string, userId: string, escolha: Prisma.VotoUncheckedCreateInput["escolha"]) {
    return prisma.voto.create({ data: { propostaId, userId, escolha } });
  },

  /** Votos favoraveis de uma proposta (para a regra de maioria). */
  countAprovo(propostaId: string) {
    return prisma.voto.count({ where: { propostaId, escolha: "APROVO" } });
  },

  /** Numero real de moradores do condominio (base da regra > 50%). */
  countMoradores(condominiumId: string) {
    return prisma.user.count({ where: { condominiumId, role: "MORADOR" } });
  },
};
