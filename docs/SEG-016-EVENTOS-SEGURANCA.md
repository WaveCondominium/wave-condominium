# SEG-016 · Eventos de Segurança e Detecção de Anomalias — Fase 1

> Status: **FASE 1 PRONTA PARA REVISÃO** — gerada fora do repositório do
> usuário (sem acesso de push nesta sessão). Falta: copiar os arquivos para
> `wave-v2-deploy`, `prisma migrate dev` (schema novo), rodar a suíte
> completa, revisar e commitar.

## ⚠️ Conflito de numeração (resolver antes de fechar o card)
Existem **dois cards diferentes chamados "SEG-016"**: este (Eventos de
Segurança) e outro já registrado anteriormente para o **upgrade do
`@stellar/stellar-sdk`** (corrige a vulnerabilidade `toml`, ver
`security/audit-exceptions.json` do SEG-013 — `cardRef: "SEG-016"` aponta
para o Stellar SDK). Antes de fechar qualquer um dos dois, renomeie um deles
no ClickUp e atualize o `cardRef` correspondente em
`security/audit-exceptions.json` para não perder o rastreamento.

## 1. Decisões confirmadas com o Robson
- **Quem consulta:** Admin de plataforma vê **todos** os condomínios;
  Síndico vê **só o próprio** condomínio ativo. Qualquer outro papel
  (Morador, Conselho) é negado — e a própria tentativa de consulta sem
  permissão vira um evento `ACESSO_NEGADO` (efeito colateral desejado: é
  exatamente esse tipo de comportamento que o card pede pra detectar).
- **Administradora:** deliberadamente **NÃO decidido ainda** — fica negada
  por padrão em `resolverEscopoConsulta` até haver uma decisão explícita
  (ela gere múltiplos condomínios; "só o próprio" não se aplica a ela do
  mesmo jeito que a um Síndico).
- **Alertas:** só painel interno nesta fase — **sem e-mail**. Achado
  relevante para fases futuras: o projeto **já tem** um serviço de e-mail
  (`getEmailService()`, usado no envio de convites em `convites.ts`) — ao
  contrário do que eu tinha avaliado antes de olhar o código. Se decidirem
  alertas por e-mail numa fase futura, dá pra reaproveisar esse serviço, não
  é integração do zero.
- **Escopo da entrega:** Fase 1 enxuta — estrutura + eventos de autenticação
  (login, logout, senha, acesso negado, revogação/restauração de acesso) +
  consulta. Regras de anomalia, alertas automáticos, exportação de dados e
  eventos de PSP ficam para a Fase 2 (seção 6).

## 2. Separação da Auditoria de negócio (confirmado no código real)
O módulo `Auditoria` existente (`BlockchainRegistry.tsx`, âncora Stellar via
`useBlockchainAutoRegistry`) já registra **decisões de negócio** — mudanças
em Boletos, Manutenção, Unidades, Reuniões, Aprovações (SÍN-026). O
`EventoSeguranca` é um model **completamente separado**, sem nenhuma
sobreposição de tabela ou de fluxo — atende literalmente o requisito do card
("auditoria de negócio" ≠ "evento de segurança").

## 3. O que foi encontrado no código real (base do desenho)
- `Session` já tinha colunas `ip`/`userAgent` no schema, mas **nunca eram
  preenchidas** — nenhuma captura de IP/user-agent existia antes desta
  entrega em lugar nenhum do app.
- **Não existia rate limiting** de tentativas de login em lugar nenhum.
- **Não existia** nenhuma trilha de eventos de autenticação — login, logout,
  troca de senha não deixavam rastro nenhum antes desta entrega.
- `passwordReset.ts` (recuperação de senha) é um **módulo client-side/demo**
  (não tem server action real) — por isso **não foi instrumentado** nesta
  fase (não dá pra logar um evento de servidor que não existe). Fica como
  pendência quando a recuperação de senha virar uma feature real.

## 4. O que foi implementado

### Banco (migração — rodar no Neon dev e homolog)
- `prisma/schema.prisma`: enums `TipoEventoSeguranca`
  (`LOGIN_SUCESSO`/`LOGIN_FALHA`/`LOGOUT`/`ACESSO_NEGADO`/`SENHA_ALTERADA`/
  `ACESSO_REVOGADO`/`ACESSO_RESTAURADO`) e `ResultadoEventoSeguranca`
  (`SUCESSO`/`FALHA`); model `EventoSeguranca` (aditivo, todas as colunas de
  contexto nullable — `userId`, `email` snapshot, `condominiumId`, `ip`,
  `userAgent`, `recurso`, `metadata` JSON). **Nunca grava senha, token ou
  credencial** — `metadata` é só para contexto técnico (ex.: motivo da
  revogação).
- `prisma/migrations/20260915000000_add_evento_seguranca/migration.sql`.
- **Append-only por design**: nenhuma action de update/delete é exposta para
  este model — nem para gestores. Não há endpoint que edite ou apague um
  evento já gravado.

### Domínio (lógica pura, testada — SEM Prisma)
- `src/server/security/eventoSeguranca.ts`: tipos, rótulos pt-BR,
  `validarResultado` (impede gravar combinação inconsistente, ex.: "logout"
  com resultado "falha") e `resolverEscopoConsulta` (a regra de quem vê o
  quê). **13 testes** (`eventoSeguranca.test.ts`).

### Servidor
- `src/server/security/registrarEventoSeguranca.ts`: grava o evento
  capturando IP (`x-forwarded-for`/`x-real-ip`) e `user-agent` via
  `headers()`. **Nunca lança** — uma falha ao gravar o log não pode derrubar
  login/logout/troca de senha.
- `src/server/repositories/eventoSegurancaRepository.ts`: `registrar` e
  `listar` (a listagem exige um `EscopoConsultaEventos` já resolvido — nunca
  aceita `condominiumId` vindo direto do cliente).
- **Instrumentado nos pontos reais:**
  - `authService.login()` — sucesso, falha de credenciais (com/sem usuário
    encontrado) e falha por acesso revogado.
  - `authService.logout()` — lê a sessão **antes** de destruí-la.
  - `authService.changePassword()` — sucesso (falha de sessão/senha repetida
    não vira evento — é validação normal de formulário, não tentativa de
    acesso indevido).
  - `convites.ts` — revogação individual de convite e revogação em lote na
    troca de morador (`revogarAnteriores`), ambas geram `ACESSO_REVOGADO`
    com o responsável (`revogadoPorUserId`) em `metadata`.
  - `guard.ts` — `requireManager`, `requirePlatformAdmin`,
    `requireAdministradora` e `requireCondominioScope` geram `ACESSO_NEGADO`
    quando um usuário **autenticado** tenta algo fora do que pode fazer.
    **Não** instrumentado em `requireSession` (sessão ausente/expirada é
    rotina — ex.: aba antiga aberta — geraria ruído demais e não é o "acesso
    negado" que o card quer capturar).
- `src/app/actions/eventosSeguranca.ts`: `listarEventosSegurancaAction` —
  aplica `resolverEscopoConsulta` e registra `ACESSO_NEGADO` na própria
  tentativa de quem não tem permissão de consultar.

### Cliente
- `src/hooks/useEventosSeguranca.ts` (loading/error/paginação).
- `src/components/security/EventosSegurancaPanel.tsx` — tabela read-only
  (Quando/Evento/Resultado/Usuário-E-mail/IP/Recurso), com loading (skeleton),
  vazio e "acesso restrito" tratados.
- `src/app/dashboard/security-events/page.tsx` — nova rota.
- `src/components/Sidebar.tsx` — item "Eventos de Segurança" visível **só**
  para Admin e Síndico (não usa `isManagerRole`, que inclui Administradora —
  ver decisão pendente acima). RBAC real continua sendo validado no
  servidor; isto é só a visibilidade do item no menu.

## 5. Verificação feita no clone
- **Vitest: 254/254** (13 novos, 241 preexistentes — nenhum quebrou).
- **ESLint**: limpo nos 11 arquivos novos/alterados.
- **Type-check escopado** (shim de `@prisma/client` só com os tipos usados
  pelo módulo novo, mesmo padrão já usado em entregas anteriores do
  projeto): limpo nos 3 arquivos que tocam Prisma diretamente
  (`eventoSeguranca.ts`, `registrarEventoSeguranca.ts`,
  `eventoSegurancaRepository.ts`).
- **Pendente na máquina do Robson:** `prisma generate` real + `tsc --noEmit`
  do projeto inteiro + `next build` (engine do Prisma bloqueada neste
  ambiente, mesma limitação já registrada em SÍN-003/SÍN-011/SÍN-012).

## 6. Critérios de aceite do card original — status
- [x] Eventos de segurança possuem estrutura própria.
- [x] Eventos estão separados da auditoria de negócio.
- [x] Login e falhas de login são registrados.
- [x] Alterações de senha são registradas.
- [ ] Alterações de **permissões/roles** — parcial: só cobre
      revogação/restauração de acesso (`ACESSO_REVOGADO`/`RESTAURADO`).
      Troca de papel/membership (ex.: SÍN-003/SÍN-031) fica para a Fase 2.
- [ ] Ações de **exportação** são registradas — Fase 2.
- [x] Acessos negados são registrados (guards de gestão + consulta negada).
- [ ] Regras básicas de anomalia — Fase 2.
- [ ] Alertas quando uma regra é acionada — Fase 2.
- [x] Logs possuem acesso restrito (RBAC no servidor via `resolverEscopoConsulta`).
- [x] Senhas, tokens e credenciais não são armazenados nos logs.
- [ ] Retenção documentada — **pendente de decisão** (não perguntado ainda).
- [ ] Testes de segurança documentados — os 13 testes cobrem a regra de
      escopo e validação; falta um teste de integração real (login →
      evento gravado) quando `prisma generate` rodar na sua máquina.

## 7. Pendências / decisões em aberto para a Fase 2
1. **Resolver a duplicidade de numeração** (seção "⚠️" acima) — bloqueia
   fechar qualquer um dos dois cards SEG-016 com clareza.
2. **Escopo da Administradora** na consulta de eventos — hoje negada por
   padrão; decidir se ela deve ver os condomínios que administra.
3. **Retenção dos logs** — por quanto tempo guardar (a tabela cresce
   indefinidamente hoje; não há job de expurgo).
4. **Fontes que faltam**: exportação de dados, acesso a dados sensíveis,
   alterações de configuração de segurança, eventos de PSP/credenciais,
   troca de papel/membership além de revogação.
5. **Motor de regras de anomalia** (item 3 do card) e **alertas** (item 4) —
   nenhum dos dois entrou nesta fase.
6. **Recuperação de senha real** (hoje é demo client-side) — quando virar
   feature de servidor, instrumentar `SENHA_RECUPERACAO_SOLICITADA`/
   `CONCLUIDA` junto.
