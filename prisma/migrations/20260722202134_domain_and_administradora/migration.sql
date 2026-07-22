-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('URGENTE', 'ALTA', 'NORMAL');

-- CreateEnum
CREATE TYPE "CategoriaAviso" AS ENUM ('ELEVADOR', 'AGUA', 'ENERGIA', 'OBRAS', 'CAIXA_DAGUA', 'DEDETIZACAO', 'SEGURANCA', 'EVENTO', 'COMUNICADO');

-- CreateEnum
CREATE TYPE "EspacoComum" AS ENUM ('SALAO', 'CHURRASQUEIRA', 'QUADRA', 'GOURMET');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusBoleto" AS ENUM ('PENDING', 'PAID', 'COMPENSATED', 'BLOCKCHAIN_REGISTERED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'CARD', 'BOLETO');

-- CreateEnum
CREATE TYPE "CategoriaProposta" AS ENUM ('OBRAS', 'SEGURANCA', 'FINANCEIRO', 'EVENTOS', 'MELHORIAS', 'SUSTENTABILIDADE', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('VOTACAO_ABERTA', 'VOTACAO_ENCERRADA', 'APROVADA_COMUNIDADE', 'FILA_PRIORIDADES', 'EM_ASSEMBLEIA', 'APROVADA_ASSEMBLEIA', 'EM_EXECUCAO', 'CONCLUIDA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "VotoEscolha" AS ENUM ('APROVO', 'REPROVO', 'ABSTENCAO');

-- CreateEnum
CREATE TYPE "StatusOcorrencia" AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMINISTRADORA';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_condominiumId_fkey";

-- AlterTable
ALTER TABLE "Condominium" ADD COLUMN     "administradoraId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "administradoraId" TEXT,
ALTER COLUMN "condominiumId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Administradora" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administradora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria" "CategoriaAviso" NOT NULL,
    "prioridade" "Prioridade" NOT NULL,
    "autorNome" TEXT NOT NULL,
    "comentariosAtivos" BOOLEAN NOT NULL DEFAULT true,
    "enviarEmail" BOOLEAN NOT NULL DEFAULT false,
    "dataEvento" TEXT,
    "horarioEvento" TEXT,
    "localEvento" TEXT,
    "publicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComentarioAviso" (
    "id" TEXT NOT NULL,
    "avisoId" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioAviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "espaco" "EspacoComum" NOT NULL,
    "data" TEXT NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "horarioFim" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "solicitante" TEXT NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "motivoRejeicao" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decididaEm" TIMESTAMP(3),
    "canceladaEm" TIMESTAMP(3),

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloqueio" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "espaco" "EspacoComum",
    "data" TEXT NOT NULL,
    "motivo" TEXT,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bloqueio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boleto" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "unitOwner" TEXT NOT NULL,
    "referenceMonth" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "barcode" TEXT NOT NULL,
    "status" "StatusBoleto" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "condominiumFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "waterFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reserveFund" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentMethod" "FormaPagamento",
    "paidAt" TIMESTAMP(3),
    "compensatedAt" TIMESTAMP(3),
    "blockchainHash" TEXT,
    "blockchainRegisteredAt" TIMESTAMP(3),
    "stellarExplorerUrl" TEXT,
    "issuedBy" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boleto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "CategoriaProposta" NOT NULL,
    "autorNome" TEXT NOT NULL,
    "status" "StatusProposta" NOT NULL DEFAULT 'VOTACAO_ABERTA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazoVotacao" TIMESTAMP(3) NOT NULL,
    "encerradaEm" TIMESTAMP(3),
    "aprovadaEm" TIMESTAMP(3),

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" TEXT NOT NULL,
    "propostaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "escolha" "VotoEscolha" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoUnidade" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoUnidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoServico" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" "StatusOcorrencia" NOT NULL DEFAULT 'ABERTA',
    "descricao" TEXT,
    "aberturaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitacaoServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManutencaoUnidade" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" "StatusOcorrencia" NOT NULL DEFAULT 'CONCLUIDA',
    "responsavel" TEXT NOT NULL,

    CONSTRAINT "ManutencaoUnidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administradora_cnpj_key" ON "Administradora"("cnpj");

-- CreateIndex
CREATE INDEX "Aviso_condominiumId_prioridade_idx" ON "Aviso"("condominiumId", "prioridade");

-- CreateIndex
CREATE INDEX "ComentarioAviso_avisoId_idx" ON "ComentarioAviso"("avisoId");

-- CreateIndex
CREATE INDEX "Reserva_condominiumId_status_idx" ON "Reserva"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "Reserva_condominiumId_espaco_data_idx" ON "Reserva"("condominiumId", "espaco", "data");

-- CreateIndex
CREATE INDEX "Bloqueio_condominiumId_data_idx" ON "Bloqueio"("condominiumId", "data");

-- CreateIndex
CREATE INDEX "Boleto_condominiumId_unitNumber_idx" ON "Boleto"("condominiumId", "unitNumber");

-- CreateIndex
CREATE INDEX "Boleto_condominiumId_status_idx" ON "Boleto"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "Proposta_condominiumId_status_idx" ON "Proposta"("condominiumId", "status");

-- CreateIndex
CREATE INDEX "Voto_propostaId_idx" ON "Voto"("propostaId");

-- CreateIndex
CREATE UNIQUE INDEX "Voto_propostaId_userId_key" ON "Voto"("propostaId", "userId");

-- CreateIndex
CREATE INDEX "DocumentoUnidade_condominiumId_unidade_idx" ON "DocumentoUnidade"("condominiumId", "unidade");

-- CreateIndex
CREATE INDEX "SolicitacaoServico_condominiumId_unidade_idx" ON "SolicitacaoServico"("condominiumId", "unidade");

-- CreateIndex
CREATE INDEX "ManutencaoUnidade_condominiumId_unidade_idx" ON "ManutencaoUnidade"("condominiumId", "unidade");

-- CreateIndex
CREATE INDEX "Condominium_administradoraId_idx" ON "Condominium"("administradoraId");

-- CreateIndex
CREATE INDEX "User_administradoraId_idx" ON "User"("administradoraId");

-- AddForeignKey
ALTER TABLE "Condominium" ADD CONSTRAINT "Condominium_administradoraId_fkey" FOREIGN KEY ("administradoraId") REFERENCES "Administradora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_administradoraId_fkey" FOREIGN KEY ("administradoraId") REFERENCES "Administradora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioAviso" ADD CONSTRAINT "ComentarioAviso_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "Aviso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloqueio" ADD CONSTRAINT "Bloqueio_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boleto" ADD CONSTRAINT "Boleto_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_condominiumId_fkey" FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
