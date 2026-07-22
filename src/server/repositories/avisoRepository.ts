// ---------------------------------------------------------------------------
// src/server/repositories/avisoRepository.ts
//
// TEMPLATE de repositorio para a migracao localStorage -> PostgreSQL.
// Todos os metodos sao escopados por condominiumId (isolamento multi-tenant).
// Replique este padrao para Reserva, Boleto, Proposta, etc.
//
// Requer `prisma generate` apos aplicar o schema (models Aviso/ComentarioAviso).
// ---------------------------------------------------------------------------

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

export const avisoRepository = {
  /** Lista os avisos de um condominio, urgentes primeiro, com comentarios. */
  listByCondominium(condominiumId: string) {
    return prisma.aviso.findMany({
      where: { condominiumId },
      include: { comentarios: { orderBy: { criadoEm: "asc" } } },
      // enum Prioridade declarado como URGENTE, ALTA, NORMAL -> asc = urgente no topo.
      orderBy: [{ prioridade: "asc" }, { publicadoEm: "desc" }],
    });
  },

  create(data: Prisma.AvisoUncheckedCreateInput) {
    return prisma.aviso.create({
      data,
      include: { comentarios: true },
    });
  },

  /** updateMany garante que so altera se o aviso pertence ao condominio. */
  update(id: string, condominiumId: string, data: Prisma.AvisoUncheckedUpdateInput) {
    return prisma.aviso.updateMany({ where: { id, condominiumId }, data });
  },

  remove(id: string, condominiumId: string) {
    return prisma.aviso.deleteMany({ where: { id, condominiumId } });
  },

  /** Adiciona comentario, garantindo que o aviso e do condominio. */
  async addComentario(avisoId: string, condominiumId: string, autor: string, conteudo: string) {
    const aviso = await prisma.aviso.findFirst({ where: { id: avisoId, condominiumId } });
    if (!aviso) return null;
    return prisma.comentarioAviso.create({ data: { avisoId, autor, conteudo } });
  },
};
