# Deploy em Produção (Vercel + PostgreSQL) — SOW Entregável 3

Guia para publicar o Wave estável, com a fundação PostgreSQL e a integração
Stellar (testnet) operacional e verificável.

## 1. Banco de dados de produção

O `localhost` do desenvolvimento NAO serve em produção. Provisione um Postgres
gerenciado (qualquer um serve):

- **Vercel Postgres** (mais integrado), **Neon**, **Supabase** ou **Railway**.

Copie a connection string (formato `postgresql://user:pass@host:5432/db?sslmode=require`).

## 2. Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)

| Variável              | Descrição                                              |
|-----------------------|--------------------------------------------------------|
| `DATABASE_URL`        | Connection string do Postgres de produção.             |
| `WAVE_SESSION_SECRET` | Segredo forte para assinar as sessões (JWT). Gere um novo, longo e aleatório. |
| `WAVE_STELLAR_SECRET` | Chave Stellar (testnet) usada para ancorar transações. |

> Use valores diferentes de desenvolvimento. Nunca commitar `.env` / segredos.

## 3. Migrations em produção

As tabelas precisam existir no banco de produção. Rode **uma vez** (localmente,
apontando para o banco de prod, ou via job/console do provedor):

```bash
# com DATABASE_URL apontando para produção
npx prisma migrate deploy
```

`migrate deploy` aplica apenas as migrations já versionadas (idempotente, sem
prompts). Alternativa: incluir no build da Vercel alterando o script para
`"build": "prisma generate && prisma migrate deploy && next build"` — assim cada
deploy garante o schema. (Requer `DATABASE_URL` acessível no build.)

## 4. Dados de demonstração (opcional, para o vídeo)

```bash
# com DATABASE_URL de produção
npx prisma db seed
```

Cria: 1 condomínio demo, usuários por papel (admin/síndico/morador…), avisos,
propostas, boletos e registros por unidade. Senha de todos: `Senha@12345`.

## 5. Build

O `package.json` já usa `prisma generate && next build`. Na Vercel, o Framework
Preset é **Next.js** (detecta sozinho). Node 18+.

Verifique localmente antes do deploy:

```bash
npm run build
```

Deve terminar com "Compiled successfully" e a lista de rotas. Se falhar por
lint/tipos, corrija antes de subir (o `next build` falha em erros de ESLint).

## 6. Checklist de deploy estável

- [ ] `DATABASE_URL`, `WAVE_SESSION_SECRET`, `WAVE_STELLAR_SECRET` setados na Vercel.
- [ ] `npx prisma migrate deploy` aplicado no banco de produção.
- [ ] (opcional) `npx prisma db seed` para dados do demo.
- [ ] `npm run build` local sem erros.
- [ ] Deploy na Vercel verde; login por papel funcionando na URL de produção.
- [ ] Os três fluxos (síndico, morador, administradora) navegáveis.
- [ ] Um pagamento gerando hash verificável em stellar.expert (testnet).
