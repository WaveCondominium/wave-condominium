# Roteiro de Vídeo Demo e Pacote de Evidências — SOW Instaward

Evidências que o revisor do Instaward pode verificar (SOW seção 6): repositório,
demo em produção, login por papel com sessões reais, e hashes de transação
Stellar (testnet) em stellar.expert.

## Preparação

- Banco de produção migrado e (idealmente) com seed: `npx prisma db seed`.
- URL de produção estável (ex: `wave-v2-two.vercel.app`).
- Credenciais (senha `Senha@12345`): `sindico@wave.com`, `morador@wave.com`,
  `administradora@wave.com` (quando o módulo administradora estiver ativo).

## Roteiro do vídeo (5–7 min)

### 1. Fundação PostgreSQL + sessões por papel (~1 min)
- Abrir a URL de produção → tela de login.
- Logar como **síndico** → mostrar o dashboard. Fazer logout.
- Logar como **morador** → mostrar que a experiência muda (RBAC).
- Falar: "dados persistidos em PostgreSQL, sessões seguras por papel — não é mais localStorage".

### 2. Fluxo do Síndico (~1.5 min)
- **Comunicação**: publicar um aviso Urgente → aparece no topo.
- **Governança**: criar uma proposta → abre votação de 30 dias.
- **Boletos**: emitir um boleto para uma unidade.
- **Reservas**: aprovar/rejeitar uma solicitação; bloquear uma data.

### 3. Fluxo do Morador (~1.5 min)
- **Dashboard**: mostrar a seção da unidade (documentos, solicitações, manutenções) — só do apto dele.
- **Governança**: votar numa proposta → tentar votar de novo (bloqueado: voto único no banco).
- **Boletos**: abrir um boleto → **Baixar PDF** / **Imprimir**; abrir um pago → **Ver comprovante** com o hash.

### 4. Âncora Stellar (~1 min) — o diferencial
- Num boleto pago, copiar o **hash da transação**.
- Abrir `https://stellar.expert/explorer/testnet/tx/<hash>` e mostrar a transação registrada.
- Falar: "cada pagamento gera prova criptográfica pública e imutável, invisível ao usuário final".

### 5. (Quando ativo) Administradora (~1 min)
- Logar como **administradora** → painel multi-condomínio.
- Entrar num condomínio e mostrar a gestão consolidada.

## Verificação de hashes (para o revisor)

Para cada pagamento com hash de 64 caracteres hex (testnet):

```
https://stellar.expert/explorer/testnet/tx/<TRANSACTION_HASH>
```

O app exibe o hash na tela de **Ver Comprovante** do boleto e no **Histórico de
Pagamentos**, com link direto para o explorer.

## Checklist de evidências (SOW seção 6)

- [ ] Repositório GitHub documentado (schema Prisma + migrations visíveis).
- [ ] Vídeo de login por papel com sessões reais.
- [ ] Demo link estável em produção.
- [ ] Percorrer os três fluxos (síndico, morador, administradora).
- [ ] Hashes de transação Stellar (testnet) verificáveis em stellar.expert.
- [ ] `docs/POSTGRES_MIGRATION.md` e `docs/DEPLOY.md` no repositório.
