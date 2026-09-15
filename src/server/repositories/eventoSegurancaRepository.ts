import { prisma } from "@/server/db";
import type {
  TipoEventoSeguranca as PrismaTipoEventoSeguranca,
  ResultadoEventoSeguranca as PrismaResultadoEventoSeguranca,
  Prisma,
} from "@prisma/client";
import type { EscopoConsultaEventos } from "@/server/security/eventoSeguranca";

export interface RegistrarEventoInput {
  tipo: PrismaTipoEventoSeguranca;
  resultado: PrismaResultadoEventoSeguranca;
  userId?: string | null;
  email?: string | null;
  condominiumId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  recurso?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

export interface ListarEventosFiltro {
  escopo: EscopoConsultaEventos;
  page?: number;
  pageSize?: number;
}

export const eventoSegurancaRepository = {
  /**
   * Grava um evento de segurança. Nunca lança para o chamador em caso de
   * falha de escrita — quem chama (registrarEventoSeguranca) decide como
   * tratar, mas a intenção é NUNCA travar o fluxo de negócio (ex.: um login
   * bem-sucedido não pode falhar por causa de um problema ao gravar o log).
   */
  async registrar(input: RegistrarEventoInput) {
    return prisma.eventoSeguranca.create({
      data: {
        tipo: input.tipo,
        resultado: input.resultado,
        userId: input.userId ?? null,
        email: input.email ?? null,
        condominiumId: input.condominiumId ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        recurso: input.recurso ?? null,
        metadata: input.metadata ?? undefined,
      },
    });
  },

  /**
   * Lista eventos já filtrados pelo escopo resolvido no servidor
   * (resolverEscopoConsulta) — nunca aceita um condominiumId vindo direto
   * do cliente sem passar por essa resolução.
   */
  async listar({ escopo, page = 1, pageSize = 50 }: ListarEventosFiltro) {
    if (escopo.tipo === "NEGADO") {
      throw new Error("Escopo negado — chamador deveria ter barrado antes de chegar aqui.");
    }
    const where: Prisma.EventoSegurancaWhereInput =
      escopo.tipo === "CONDOMINIO" ? { condominiumId: escopo.condominiumId } : {};

    const [itens, total] = await Promise.all([
      prisma.eventoSeguranca.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.eventoSeguranca.count({ where }),
    ]);

    return { itens, total, page, pageSize };
  },
};
