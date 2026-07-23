// ---------------------------------------------------------------------------
// src/server/repositories/reservaRepository.ts
//
// Repositorio de Reservas (Reserva/Bloqueio), escopado por condominiumId.
// Mesmo padrao dos demais (migracao localStorage -> Postgres).
//
// Requer `prisma generate` apos o schema (models Reserva/Bloqueio).
// ---------------------------------------------------------------------------

import type { Prisma, EspacoComum } from "@prisma/client";
import { prisma } from "@/server/db";

export const reservaRepository = {
  listReservas(condominiumId: string) {
    return prisma.reserva.findMany({ where: { condominiumId }, orderBy: { criadaEm: "desc" } });
  },

  listBloqueios(condominiumId: string) {
    return prisma.bloqueio.findMany({ where: { condominiumId }, orderBy: { criadoEm: "desc" } });
  },

  findReserva(id: string, condominiumId: string) {
    return prisma.reserva.findFirst({ where: { id, condominiumId } });
  },

  createReserva(data: Prisma.ReservaUncheckedCreateInput) {
    return prisma.reserva.create({ data });
  },

  updateReserva(id: string, condominiumId: string, data: Prisma.ReservaUncheckedUpdateInput) {
    return prisma.reserva.updateMany({ where: { id, condominiumId }, data });
  },

  createBloqueio(data: Prisma.BloqueioUncheckedCreateInput) {
    return prisma.bloqueio.create({ data });
  },

  removeBloqueio(id: string, condominiumId: string) {
    return prisma.bloqueio.deleteMany({ where: { id, condominiumId } });
  },

  /** Reserva aprovada que ocupa o espaco+data (para checagem de conflito). */
  findReservaAprovada(condominiumId: string, espaco: EspacoComum, data: string) {
    return prisma.reserva.findFirst({ where: { condominiumId, espaco, data, status: "APROVADA" } });
  },

  /** Bloqueio que atinge o espaco+data (inclui bloqueio geral, espaco = null). */
  findBloqueioAtivo(condominiumId: string, espaco: EspacoComum, data: string) {
    return prisma.bloqueio.findFirst({
      where: { condominiumId, data, OR: [{ espaco }, { espaco: null }] },
    });
  },
};
