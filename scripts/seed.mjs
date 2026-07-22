import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// --- Condominio + usuarios ---------------------------------------------------

const condo = await prisma.condominium.upsert({
  where: { id: "seed-condo" },
  update: {},
  create: { id: "seed-condo", name: "Condominio Demo" },
});

const passwordHash = await bcrypt.hash("Senha@12345", 12);

const demoUsers = [
  { email: "admin@wave.com",    name: "Administrador Wave", role: "ADMIN",   unit: "Administracao" },
  { email: "sindico@wave.com",  name: "Joao Silva",         role: "SINDICO", unit: "Apto 101" },
  { email: "morador@wave.com",  name: "Maria Santos",       role: "MORADOR", unit: "Apto 203" },
  { email: "morador2@wave.com", name: "Carlos Mendes",      role: "MORADOR", unit: "Apto 204" },
  { email: "morador3@wave.com", name: "Ana Paula",          role: "MORADOR", unit: "Apto 205" },
  { email: "morador4@wave.com", name: "Pedro Lima",         role: "MORADOR", unit: "Apto 206" },
  { email: "morador5@wave.com", name: "Beatriz Rocha",      role: "MORADOR", unit: "Apto 207" },
];

const usersByEmail = {};
for (const u of demoUsers) {
  const saved = await prisma.user.upsert({
    where: { condominiumId_email: { condominiumId: condo.id, email: u.email } },
    update: { passwordHash, name: u.name, role: u.role, unit: u.unit },
    create: { ...u, passwordHash, condominiumId: condo.id },
  });
  usersByEmail[u.email] = saved.id;
  console.log("Seed ok ->", u.email, "(" + u.role + ")");
}

const moradores = [
  "morador@wave.com", "morador2@wave.com", "morador3@wave.com",
  "morador4@wave.com", "morador5@wave.com",
].map((e) => usersByEmail[e]);

// --- Limpa dados de dominio do condominio (idempotencia) ---------------------

await prisma.proposta.deleteMany({ where: { condominiumId: condo.id } });
await prisma.aviso.deleteMany({ where: { condominiumId: condo.id } });

// --- Avisos (Comunicacao) ----------------------------------------------------

const avisos = [
  {
    titulo: "Manutencao Programada do Elevador A",
    conteudo: "O elevador A passara por manutencao preventiva no dia 20 das 8h as 17h. Utilizem o elevador B.",
    categoria: "ELEVADOR", prioridade: "URGENTE",
  },
  {
    titulo: "Interrupcao no Fornecimento de Agua",
    conteudo: "A concessionaria fara manutencao na rede das 9h as 12h. Recomendamos reservar agua.",
    categoria: "AGUA", prioridade: "ALTA",
  },
  {
    titulo: "Nova Escala de Coleta Seletiva",
    conteudo: "A coleta seletiva passa a ser as tercas e quintas. Separe corretamente os residuos.",
    categoria: "COMUNICADO", prioridade: "NORMAL",
  },
];
for (const a of avisos) {
  await prisma.aviso.create({
    data: { condominiumId: condo.id, autorNome: "Sindico Joao Silva", comentariosAtivos: true, ...a },
  });
}
console.log("Seed ok -> " + avisos.length + " avisos");

// --- Propostas (Governanca) --------------------------------------------------

function votos(escolhas) {
  // escolhas: array alinhado com `moradores`; entradas nulas nao votam.
  return escolhas
    .map((e, i) => (e ? { userId: moradores[i], escolha: e } : null))
    .filter(Boolean);
}

const propostas = [
  {
    titulo: "Instalacao de Energia Solar", descricao: "Sistema fotovoltaico nas areas comuns para reduzir a conta de energia.",
    categoria: "SUSTENTABILIDADE", status: "VOTACAO_ABERTA", autorNome: "Maria Santos - Apto 203",
    criadaEm: daysFromNow(-10), prazoVotacao: daysFromNow(20),
    votos: votos(["APROVO", "APROVO", "REPROVO", "ABSTENCAO", null]),
  },
  {
    titulo: "Cameras Inteligentes", descricao: "Upgrade do sistema de seguranca com reconhecimento e visao noturna.",
    categoria: "SEGURANCA", status: "APROVADA_COMUNIDADE", autorNome: "Sindico Joao Silva",
    criadaEm: daysFromNow(-40), prazoVotacao: daysFromNow(-10), encerradaEm: daysFromNow(-10), aprovadaEm: daysFromNow(-10),
    votos: votos(["APROVO", "APROVO", "APROVO", "APROVO", "REPROVO"]),
  },
  {
    titulo: "Reforma da Academia", descricao: "Modernizacao dos equipamentos e do piso da academia.",
    categoria: "MELHORIAS", status: "EM_EXECUCAO", autorNome: "Carlos Mendes - Apto 204",
    criadaEm: daysFromNow(-70), prazoVotacao: daysFromNow(-40), encerradaEm: daysFromNow(-40), aprovadaEm: daysFromNow(-40),
    votos: votos(["APROVO", "APROVO", "APROVO", "REPROVO", "APROVO"]),
  },
  {
    titulo: "Pintura da Fachada", descricao: "Repintura completa da fachada e areas externas.",
    categoria: "OBRAS", status: "CONCLUIDA", autorNome: "Sindico Joao Silva",
    criadaEm: daysFromNow(-120), prazoVotacao: daysFromNow(-90), encerradaEm: daysFromNow(-90), aprovadaEm: daysFromNow(-90),
    votos: votos(["APROVO", "APROVO", "APROVO", "APROVO", "APROVO"]),
  },
  {
    titulo: "Aumento da Taxa de Eventos", descricao: "Proposta para aumentar a taxa de uso do salao em 30%.",
    categoria: "FINANCEIRO", status: "REJEITADA", autorNome: "Beatriz Rocha - Apto 207",
    criadaEm: daysFromNow(-45), prazoVotacao: daysFromNow(-15), encerradaEm: daysFromNow(-15),
    votos: votos(["REPROVO", "REPROVO", "APROVO", "REPROVO", "REPROVO"]),
  },
];

for (const p of propostas) {
  const { votos: vs, ...rest } = p;
  await prisma.proposta.create({
    data: { condominiumId: condo.id, ...rest, votos: { create: vs } },
  });
}
console.log("Seed ok -> " + propostas.length + " propostas");

console.log("Senha para todos: Senha@12345");
await prisma.$disconnect();
