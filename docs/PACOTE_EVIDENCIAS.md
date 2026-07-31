# Pacote de Evidências — SOW Instaward Stellar
## Wave Condominium · MVP Fase 1

Documento de verificação para o revisor do Instaward (SOW, Seção 6). Reúne, para
cada um dos três entregáveis, **o que verificar**, **como verificar** e **onde**.

> **Atenção — links atualizados.** O SOW original citava `ravenahash/wave-v2` e
> `wave-v2-two.vercel.app`. Os endereços corretos e vigentes são os abaixo.

---

## Links oficiais

| Recurso | Endereço |
|---|---|
| Aplicação em produção | https://wave-condominium.vercel.app |
| Repositório GitHub | https://github.com/WaveCondominium/wave-condominium |
| Explorador Stellar (testnet) | https://stellar.expert/explorer/testnet |
| Vídeo demo | **[PREENCHER com o link após a gravação]** |

## Credenciais de verificação

Senha única para todas as contas de demonstração: **`Senha@12345`**

| Perfil | E-mail |
|---|---|
| Síndico | `sindico@wave.com` |
| Morador | `morador@wave.com` |
| Administradora | `administradora@wave.com` |

---

## Entregável 1 — Migração para PostgreSQL + Perfis

**O que foi entregue:** substituição completa do `localStorage` por PostgreSQL
persistente, com sessões seguras por papel (síndico, morador, administradora).

**Como o revisor verifica:**

1. **Schema e migrations no repositório:**
   - `prisma/schema.prisma` — modelos e enums do domínio (Aviso, Reserva, Boleto,
     Proposta, Voto, Condominium, Administradora, User com papéis).
   - `prisma/migrations/` — migrations versionadas aplicadas ao banco.
2. **Login real com sessão segura:**
   - Acessar a demo → `/login` → entrar como **Síndico**. Depois logout e entrar
     como **Morador**: a interface e o menu mudam conforme o papel (RBAC).
   - As sessões são JWT assinadas (cookie `httpOnly wave_session`), não localStorage.
3. **Persistência entre sessões/usuários:** criar um aviso como síndico e conferir
   que ele persiste após novo login (dado no servidor, não no navegador).

**Referências no repo:** `src/server/auth/` (session/guard), `src/server/services/authService.ts`,
`src/server/repositories/`, `docs/POSTGRES_MIGRATION.md`,
`docs/FLUXOGRAMA_AUTH_PERMISSOES.pdf` (fluxo de autenticação/permissões).

---

## Entregável 2 — Módulo Administradora (≥ 50% de cobertura)

**O que foi entregue:** painel multi-condomínio, seleção de condomínio ativo,
gestão consolidada e hierarquia de permissões (administradora > síndico > morador).

**Como o revisor verifica:**

1. Entrar como **Administradora** (`administradora@wave.com`) → cai no
   **Painel da Administradora** com métricas consolidadas e um card por condomínio.
2. Clicar em **Gerenciar** em um condomínio → banner "Gerenciando ..." e todas as
   telas (Boletos, Governança, Comunicação) passam a operar naquele condomínio.
3. Clicar em **Trocar condomínio** → voltar ao painel → entrar em outro condomínio
   e confirmar que os dados mudam.
4. **Isolamento:** a administradora só acessa os condomínios sob sua gestão
   (validado no servidor por `requireCondominioScope`).

**Dados de demonstração:** 3 condomínios sob a administradora — Residencial Aurora,
Edifício Horizonte e Parque das Flores — cada um com síndico, moradores, avisos,
boletos e propostas próprios.

**Referências no repo:** `src/app/dashboard/administradora/`,
`src/components/administradora/AdministradoraPanel.tsx`,
`src/app/actions/administradora.ts`, `src/server/repositories/condominiumRepository.ts`.

---

## Entregável 3 — Aplicação Web Consolidada e Estável em Produção

**O que foi entregue:** build e deploy estáveis na Vercel, com os módulos síndico,
morador e administradora funcionais, integração Stellar (testnet) operacional e
interface responsiva (desktop, tablet e mobile).

**Como o revisor verifica:**

1. Acessar https://wave-condominium.vercel.app — aplicação carrega em produção.
2. Percorrer os **três fluxos** (síndico, morador, administradora) — todos operacionais.
3. Abrir em um celular (ou DevTools em modo mobile) — layout responsivo.
4. Verificar a âncora Stellar (seção abaixo).

**Referências no repo:** `docs/DEPLOY.md` (deploy + variáveis de ambiente),
`docs/ROTEIRO_DEMO.pdf` (roteiro do vídeo).

---

## Verificação da âncora Stellar (testnet) — o diferencial técnico

Cada pagamento de boleto gera uma prova criptográfica (hash SHA-256 via `memo_hash`)
registrada na rede Stellar. No app, o hash aparece em **Boletos → Ver Comprovante**
e no **Histórico de Pagamentos**, com link direto para o explorer.

Para verificar uma transação, abra:

```
https://stellar.expert/explorer/testnet/tx/<TRANSACTION_HASH>
```

**Hashes de exemplo capturados na demonstração _(preencher após a gravação)_:**

| Boleto / unidade | Transaction hash (testnet) | Link no explorer |
|---|---|---|
| [PREENCHER] | [PREENCHER — 64 hex] | https://stellar.expert/explorer/testnet/tx/[HASH] |
| [PREENCHER] | [PREENCHER] | https://stellar.expert/explorer/testnet/tx/[HASH] |

---

## Documentos de apoio (no repositório, pasta `docs/`)

| Documento | Conteúdo |
|---|---|
| `PACOTE_EVIDENCIAS.md` | Este documento — índice de evidências (Seção 6). |
| `FLUXOGRAMA_AUTH_PERMISSOES.pdf` / `.png` | Fluxo de autenticação e matriz de permissões (Semana 2). |
| `ROTEIRO_DEMO.pdf` / `.md` | Roteiro do vídeo de demonstração. |
| `POSTGRES_MIGRATION.md` | Detalhes da migração localStorage → PostgreSQL. |
| `DEPLOY.md` | Deploy em produção e variáveis de ambiente. |

---

## Checklist final de submissão (SOW, Seção 6)

- [ ] Repositório GitHub documentado (schema Prisma + migrations visíveis).
- [ ] Vídeo demo gravado e link inserido neste documento.
- [ ] Demo link estável em produção acessível ao revisor.
- [ ] Três fluxos verificáveis (síndico, morador, administradora).
- [ ] Pelo menos 1–2 hashes de transação Stellar (testnet) preenchidos e verificáveis.
- [ ] Fluxograma de autenticação/permissões incluído (Semana 2).
- [ ] Confirmar com o Ambassador Chapter Lead os links atualizados (repo/demo).

---

_Preencher os campos marcados com **[PREENCHER]** após a gravação do vídeo e a
captura dos hashes. Depois disso, este pacote está pronto para submissão._
