// ---------------------------------------------------------------------------
// src/server/repositories/unitRepository.ts
//
// Registros por unidade do Dashboard do Morador (documentos, solicitacoes,
// manutencoes), escopados por condominiumId. O filtro por unidade e feito na
// action (comparacao normalizada), garantindo que o morador so veja o seu apto.
//
// Requer `prisma generate` (models DocumentoUnidade/SolicitacaoServico/ManutencaoUnidade).
// ---------------------------------------------------------------------------

import { prisma } from "@/server/db";

export const unitRepository = {
  listDocs(condominiumId: string) {
    return prisma.documentoUnidade.findMany({ where: { condominiumId }, orderBy: { data: "desc" } });
  },
  listSolicitacoes(condominiumId: string) {
    return prisma.solicitacaoServico.findMany({ where: { condominiumId }, orderBy: { aberturaEm: "desc" } });
  },
  listManutencoes(condominiumId: string) {
    return prisma.manutencaoUnidade.findMany({ where: { condominiumId }, orderBy: { data: "desc" } });
  },
};
