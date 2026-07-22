# Migração localStorage → PostgreSQL (SOW Instaward — Entregável 1)

Guia de execução da fundação de dados do Wave. A autenticação já é persistida no
Postgres; este plano migra os **módulos de domínio** (hoje em `localStorage`) para
o banco, com **isolamento multi-tenant por condomínio** e suporte a **Administradora**
(multi-condomínio).

## 1. Aplicar o schema

O `prisma/schema.prisma` já contém: `Administradora`, `Condominium`
(com `administradoraId`), papel `ADMINISTRADORA`, e os modelos de domínio
(`Aviso`/`ComentarioAviso`, `Reserva`/`Bloqueio`, `Boleto`, `Proposta`/`Voto`,
`DocumentoUnidade`, `SolicitacaoServico`, `ManutencaoUnidade`).

```bash
# valida o schema
npx prisma validate

# cria a migration e aplica no banco de desenvolvimento
npx prisma migrate dev --name domain_and_administradora

# regenera o Prisma Client (necessário para os repositories/actions compilarem)
npx prisma generate
```

> Importante: os arquivos `src/server/repositories/avisoRepository.ts` e
> `src/app/actions/avisos.ts` só compilam **após** `prisma generate`, pois usam
> os novos modelos (`prisma.aviso`, enums `Prioridade`/`CategoriaAviso`).

Atualize também o seed (`scripts/seed.mjs`) para criar uma `Administradora`, alguns
`Condominium` vinculados e usuários de cada papel (incluindo `ADMINISTRADORA`).

## 2. Papéis e escopo (já implementados)

- `src/lib/rbac.ts`: `isManager` agora inclui `Administradora`; novo `isAdministradora`.
- `src/hooks/useAuth.ts`: papel `Administradora` no tipo `User`.
- `src/server/auth/session.ts`: `SessionPayload` com `condominiumId` (nullable) e
  `administradoraId`.
- `src/server/auth/guard.ts`: `requireAdministradora` e `requireCondominioScope(condominiumId)`.
- `src/server/services/authService.ts`: mapa `ADMINISTRADORA ↔ Administradora`.

Regra multi-tenant: **toda leitura/escrita de domínio é escopada por `condominiumId`**
vindo da sessão (síndico/morador) ou do condomínio ativo selecionado pela Administradora.

## 3. Padrão de migração por módulo (template = Avisos)

Cada módulo já tem a persistência isolada num hook. A troca é mecânica:

1. **Repository** (`src/server/repositories/<x>Repository.ts`) — CRUD Prisma escopado
   por `condominiumId`. Ver `avisoRepository.ts`.
2. **Server actions** (`src/app/actions/<x>.ts`) — guard + escopo + mapeamento
   enum app↔DB + retorno no formato que o hook já usa. Ver `avisos.ts`.
3. **Trocar o corpo do hook** — de `useLocalStorage` para as actions (assíncrono):

```ts
// Antes (localStorage, síncrono):
const [raw, setRaw] = useLocalStorage<Aviso[]>('wave_avisos_v2', SEED);

// Depois (Postgres, assíncrono):
const [avisos, setAvisos] = useState<Aviso[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => { listAvisosAction().then(setAvisos).finally(() => setLoading(false)); }, []);
const criar = async (input, autor) => {
  const novo = await criarAvisoAction(input, autor);
  if (novo) setAvisos((prev) => [novo, ...prev]);
};
// editar/excluir/comentar chamam as actions e atualizam o estado local.
```

Os componentes já tratam `loading` (skeletons) na maioria dos módulos; onde não
houver, adicionar o estado de carregamento.

## 4. Mapa chave localStorage → tabela

| Módulo         | Chave localStorage        | Tabela(s) Prisma                      | Prioridade |
|----------------|---------------------------|---------------------------------------|-----------|
| Comunicação    | `wave_avisos_v2`          | `Aviso`, `ComentarioAviso`            | 1 (template) |
| Reservas       | `wave_reservas_v2`, `wave_bloqueios` | `Reserva`, `Bloqueio`      | 2 |
| Governança     | `wave_proposals_v2`       | `Proposta`, `Voto`                    | 2 |
| Boletos        | `wave_boletos`            | `Boleto`                              | 3 |
| Dashboard morador | `wave_unit_docs`, `wave_unit_requests`, `wave_unit_maintenance` | `DocumentoUnidade`, `SolicitacaoServico`, `ManutencaoUnidade` | 3 |
| Notificações   | `wave_notifications`      | (opcional) tabela `Notificacao`       | 4 |

Ordem sugerida no sprint: **Comunicação → Governança → Reservas → Boletos → Dashboard**.

## 5. Administradora (multi-condomínio — Entregável 2)

- Login de Administradora popula `administradoraId` na sessão (e `condominiumId` nulo).
- Painel multi-condomínio lista `condominium.findMany({ where: { administradoraId } })`.
- Ao selecionar um condomínio, guardar o `condominiumId` ativo (cookie/estado) e usar
  `requireCondominioScope(condominiumId)` nas actions.
- Hierarquia: `ADMINISTRADORA` é superset do `SINDICO` para os condomínios que gere.

## 6. Evidências (SOW seção 6)

- Schema versionado no repositório + migration aplicada.
- Vídeo de login por papel (síndico/morador/administradora) com sessão real.
- Hashes de transação Stellar (testnet) verificáveis em stellar.expert.
- Demo estável em produção percorrendo os três fluxos.
